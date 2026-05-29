import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { supabase, getAdminClient } from '../config/supabase.js';
import logger from '../services/logger.js';
import { redis } from '../config/redis.js';

import { AppError } from './error.js';

const jwtSecret = process.env.JWT_SECRET;

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

const setProfileL1 = (userId: string, role: string, fullName: string): void => {
  profileL1.set(userId, { role, fullName, expiresAt: Date.now() + L1_AUTH_TTL_MS });
};

const delProfileL1 = (userId: string): void => {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  // eslint-disable-line @typescript-eslint/no-unused-vars
  profileL1.delete(userId);
};

export interface AuthRequest extends Request {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  user?: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
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

        const cacheKey = `user_profile:${user.id}`;

        // ── L1 check (zero Redis cost) ──
        const l1Hit = getProfileL1(user.id);
        if (l1Hit) {
          // eslint-disable-line @typescript-eslint/no-explicit-any
          role = l1Hit.role;
          fullName = l1Hit.fullName;
        } else {
          // ── L2 Redis check ──
          let cachedProfile: any = null;
          // eslint-disable-line @typescript-eslint/no-explicit-any
          try {
            if (redis.status === 'ready') {
              const data = await redis.get(cacheKey);
              if (data) cachedProfile = JSON.parse(data);
            }
          } catch (_e) {
            /* ignore */
          }

          if (cachedProfile) {
            role = cachedProfile.role;
            fullName = cachedProfile.fullName;
            setProfileL1(user.id, role, fullName); // backfill L1
          } else {
            // ── DB fetch (cache miss) ──
            try {
              const admin = await getAdminClient();
              const { data: profile } = await admin
                .from('user_profiles')
                .select('role, full_name')
                .eq('id', user.id)
                .single();

              role = profile?.role || 'user';
              fullName = profile?.full_name || user.email?.split('@')[0];

              // Write to L1 and L2
              setProfileL1(user.id, role, fullName);
              try {
                if (redis.status === 'ready') {
                  await redis.set(
                    cacheKey,
                    JSON.stringify({ role, fullName }),
                    'EX',
                    REDIS_AUTH_TTL_S
                    // eslint-disable-line @typescript-eslint/no-explicit-any
                  );
                }
              } catch (_e) {
                /* ignore */
              }
            } catch (profileError: any) {
              // eslint-disable-line @typescript-eslint/no-explicit-any
              logger.error(`[Auth] Profile fetch failed: ${profileError.message}`);
              role = 'user';
              fullName = user.email?.split('@')[0];
            }
            // eslint-disable-line @typescript-eslint/no-explicit-any
          }
        }
      }
    } else {
      // 2. Try Local JWT (for hardcoded admin)
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        // eslint-disable-line @typescript-eslint/no-explicit-any
        user = { id: decoded.id, email: decoded.email };
        role = decoded.role || 'user';
        fullName = 'Main Admin';
      } catch (jwtError) {
        logger.warn(`[Auth] Validation failed for ${req.path}: ${(jwtError as Error).message}`);
        return next(new AppError('Invalid or expired token', 401));
      }
    }

    req.user = {
      ...user,
      role,
      fullName,
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
        const cacheKey = `user_profile:${sbUser.id}`;
        let cachedProfile: any = null;
        // eslint-disable-line @typescript-eslint/no-explicit-any

        try {
          if (redis.status === 'ready') {
            const data = await redis.get(cacheKey);
            if (data) cachedProfile = JSON.parse(data);
          }
        } catch (_e) {
          /* ignore cache errors */
        }

        if (cachedProfile) {
          req.user = {
            ...sbUser,
            role: cachedProfile.role,
            fullName: cachedProfile.fullName,
          };
        } else {
          try {
            const admin = await getAdminClient();
            const { data: profile } = await admin
              .from('user_profiles')
              .select('role, full_name')
              .eq('id', sbUser.id)
              .single();

            const role = profile?.role || 'user';
            const fullName = profile?.full_name || sbUser.email?.split('@')[0];

            // eslint-disable-line @typescript-eslint/no-explicit-any
            req.user = { ...sbUser, role, fullName };

            // Cache it
            try {
              if (redis.status === 'ready') {
                await redis.set(cacheKey, JSON.stringify({ role, fullName }), 'EX', 3600);
              }
            } catch (_e) {
              /* ignore cache errors */
            }
          } catch (_profileErr: any) {
            // eslint-disable-line @typescript-eslint/no-explicit-any
            req.user = {
              ...sbUser,
              role: 'user',
              fullName: sbUser.email?.split('@')[0],
            };
          }
        }
        // eslint-disable-line @typescript-eslint/no-unused-vars
      }
    } else {
      // Try local JWT fallback
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        // eslint-disable-line @typescript-eslint/no-explicit-any
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'user',
          fullName: 'Main Admin',
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
