import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { supabase, getAdminClient } from '../config/supabase.js';
import logger from '../services/logger.js';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';

import { AppError } from './error.js';

const jwtSecret = env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required for backend authentication');
}

const JWT_SECRET: string = jwtSecret;

// ─── L1 In-Memory Auth Profile Cache ─────────────────────────────────────────
// Sits in front of Redis to avoid a network round-trip on every API request.
// At 10k users with ~15 reqs/day each → saves ~855k Redis GET commands/month.
interface ProfileEntry {
  role: string;
  fullName: string;
  tenantId: string;
  expiresAt: number;
}
const profileL1 = new Map<string, ProfileEntry>();
const L1_AUTH_TTL_MS = 2 * 60 * 1000; // 2 minutes in-memory
const REDIS_AUTH_TTL_S = 86_400; // 24 hours in Redis (was 3600)

const getProfileL1 = (userId: string): ProfileEntry | null => {
  const entry = profileL1.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    profileL1.delete(userId);
    return null;
  }
  return entry;
};

const setProfileL1 = (userId: string, role: string, fullName: string, tenantId: string): void => {
  profileL1.set(userId, { role, fullName, tenantId, expiresAt: Date.now() + L1_AUTH_TTL_MS });
};

const delProfileL1 = (userId: string): void => {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  // eslint-disable-line @typescript-eslint/no-unused-vars
  profileL1.delete(userId);
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'super-admin' | 'admin' | 'manager' | 'support' | 'warehouse-staff' | 'user' | string;
  fullName: string;
  tenant_id: string;
  [key: string]: any;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Fetches user profile (role, fullName, tenantId) from L1 in-memory cache,
 * then L2 Redis, then database – in that priority order.
 * Writes through to lower tiers on a cache miss.
 */
async function resolveUserProfile(
  user: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{ role: string; fullName: string; tenantId: string }> {
  const cacheKey = `user_profile:${user.id}`;

  // L1 check
  const l1Hit = getProfileL1(user.id);
  if (l1Hit) {
    return { role: l1Hit.role, fullName: l1Hit.fullName, tenantId: l1Hit.tenantId };
  }

  // L2 Redis check
  let cachedProfile: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    if (redis && redis.status === 'ready') {
      const data = await redis.get(cacheKey);
      if (data) cachedProfile = JSON.parse(data);
    }
  } catch (_e) {
    /* ignore */
  }

  if (cachedProfile) {
    const { role, fullName, tenantId } = cachedProfile;
    setProfileL1(user.id, role, fullName, tenantId || user.id);
    return { role, fullName, tenantId: tenantId || user.id };
  }

  // DB fetch (cache miss)
  let role = 'user';
  let fullName = user.email?.split('@')[0] ?? '';
  const tenantId = user.id;

  try {
    const admin = await getAdminClient();
    const { data: profile } = await admin
      .from('user_profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    role = profile?.role || 'user';
    fullName = profile?.full_name || fullName;
  } catch (profileError: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    logger.error(`[Auth] Profile fetch failed: ${(profileError as Error).message}`);
  }

  setProfileL1(user.id, role, fullName, tenantId);
  try {
    if (redis && redis.status === 'ready') {
      await redis.set(
        cacheKey,
        JSON.stringify({ role, fullName, tenantId }),
        'EX',
        REDIS_AUTH_TTL_S
      );
    }
  } catch (_e) {
    /* ignore */
  }

  return { role, fullName, tenantId };
}

/**
 * Revokes/blacklists a token in Redis until its natural expiration.
 */
export const blacklistToken = async (token: string, expiresAtUnix: number): Promise<void> => {
  try {
    if (redis && redis.status === 'ready') {
      const ttl = Math.max(0, expiresAtUnix - Math.floor(Date.now() / 1000));
      if (ttl > 0) {
        await redis.set(`blacklist:token:${token}`, '1', 'EX', ttl);
        logger.info(`[Auth] Token successfully blacklisted for ${ttl} seconds`);
      }
    }
  } catch (err) {
    logger.error(`[Auth] Failed to blacklist token: ${(err as Error).message}`);
  }
};
// eslint-disable-line complexity

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // eslint-disable-line complexity
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Unauthorized', 401));
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    try {
      if (redis && redis.status === 'ready') {
        const isBlacklisted = await redis.get(`blacklist:token:${token}`);
        if (isBlacklisted) {
          logger.warn(`[Auth] Access attempted with blacklisted token for path: ${req.path}`);
          return next(new AppError('Invalid or expired token', 401));
        }
      }
    } catch (redisErr) {
      logger.error(`[Auth] Blacklist check error: ${(redisErr as Error).message}`);
      // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    let user: any = null;
    // eslint-disable-line @typescript-eslint/no-explicit-any
    let role: string = 'user';
    let fullName: string = '';
    let tenantId: string = '';

    const decodedUnverified: any = jwt.decode(token);
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const isSupabaseToken =
      decodedUnverified && decodedUnverified.iss && decodedUnverified.iss.includes('supabase');

    if (isSupabaseToken) {
      // 1. Try Supabase Auth
      const {
        data: { user: sbUser },
        error: sbError,
      } = await supabase.auth.getUser(token);

      if (sbUser && !sbError) {
        user = sbUser;
        const { role: r, fullName: fn, tenantId: tid } = await resolveUserProfile(sbUser);
        role = r;
        fullName = fn;
        tenantId = tid;
      }
    } else {
      // 2. Try Local JWT (for hardcoded admin)
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        // eslint-disable-line @typescript-eslint/no-explicit-any
        user = { id: decoded.id, email: decoded.email };
        role = decoded.role || 'user';
        fullName = 'Main Admin';
        tenantId = user.id;
      } catch (jwtError) {
        logger.warn(`[Auth] Validation failed for ${req.path}: ${(jwtError as Error).message}`);
        return next(new AppError('Invalid or expired token', 401));
      }
    }

    req.user = {
      ...user,
      role,
      fullName,
      tenant_id: tenantId,
    };
    // eslint-disable-line complexity

    next();
  } catch (err) {
    next(err);
  }
};

export const authenticateOptional = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // eslint-disable-line complexity
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    try {
      if (redis && redis.status === 'ready') {
        const isBlacklisted = await redis.get(`blacklist:token:${token}`);
        if (isBlacklisted) {
          // eslint-disable-line @typescript-eslint/no-explicit-any
          logger.warn(`[Auth] Optional auth: Attempted use of blacklisted token`);
          return next();
        }
      }
    } catch (redisErr) {
      logger.error(`[Auth] Blacklist check error: ${(redisErr as Error).message}`);
    }

    const decodedUnverified: any = jwt.decode(token);
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const isSupabaseToken =
      decodedUnverified && decodedUnverified.iss && decodedUnverified.iss.includes('supabase');
    // eslint-disable-line @typescript-eslint/no-explicit-any

    if (isSupabaseToken) {
      const {
        data: { user: sbUser },
        error: sbError,
      } = await supabase.auth.getUser(token);

      if (sbUser && !sbError) {
        const { role, fullName, tenantId } = await resolveUserProfile(sbUser);
        req.user = { ...sbUser, email: sbUser.email || '', role, fullName, tenant_id: tenantId };
      }
    } else {
      // Try local JWT fallback
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        // eslint-disable-line @typescript-eslint/no-explicit-any
        req.user = {
          id: decoded.id,
          email: decoded.email || '',
          role: decoded.role || 'user',
          fullName: 'Main Admin',
          tenant_id: decoded.id,
        };
      } catch (jwtErr) {
        // eslint-disable-line @typescript-eslint/no-unused-vars
        // Proceed as guest
      }
    }
  } catch (err) {
    logger.debug(`[Auth] Optional auth failed: ${(err as Error).message}`);
  }
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Unauthorized', 401));
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(
          `[Auth] Access denied for user ${req.user.id}. Role: ${req.user.role}. Required: ${roles.join(', ')}`
        );
        return next(new AppError('Forbidden: Access denied', 403));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const requireSuperAdmin = authorize('super-admin');
export const requireAdmin = authorize('super-admin', 'admin');
export const requireManager = authorize('super-admin', 'admin', 'manager');
export const requireSupport = authorize('super-admin', 'admin', 'manager', 'support');
export const requireWarehouse = authorize('super-admin', 'admin', 'manager', 'warehouse-staff');
