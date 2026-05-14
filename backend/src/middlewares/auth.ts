import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase, getAdminClient } from '../config/supabase.js';
import { AppError } from './error.js';
import logger from '../services/logger.js';
import { redis } from '../config/redis.js';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required for backend authentication');
}

const JWT_SECRET: string = jwtSecret;

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Unauthorized', 401));
    }

    const token = authHeader.split(' ')[1];
    let user: any = null;
    let role: string = 'user';
    let fullName: string = '';

    // 1. Try Supabase Auth
    const {
      data: { user: sbUser },
      error: sbError,
    } = await supabase.auth.getUser(token);

    if (sbUser && !sbError) {
      user = sbUser;

      // Try Redis Cache for Profile
      const cacheKey = `user_profile:${user.id}`;
      let cachedProfile: any = null;

      try {
        if (redis.status === 'ready') {
          const data = await redis.get(cacheKey);
          if (data) cachedProfile = JSON.parse(data);
        }
      } catch (cacheErr) {
        // Silently continue if Redis fails
      }

      if (cachedProfile) {
        role = cachedProfile.role;
        fullName = cachedProfile.fullName;
      } else {
        try {
          const admin = await getAdminClient();
          const { data: profile } = await admin
            .from('user_profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single();

          role = profile?.role || 'user';
          fullName = profile?.full_name || user.email?.split('@')[0];

          // Save to Cache
          try {
            if (redis.status === 'ready') {
              await redis.set(cacheKey, JSON.stringify({ role, fullName }), 'EX', 3600); // 1 hour
            }
          } catch (e) {
            /* ignore */
          }
        } catch (profileError: any) {
          logger.error(`[Auth] Profile fetch failed: ${profileError.message}`);
          role = 'user';
          fullName = user.email?.split('@')[0];
        }
      }
    } else {
      // 2. Try Local JWT (for hardcoded admin)
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        user = { id: decoded.id, email: decoded.email };
        role = decoded.role || 'user';
        fullName = 'Main Admin';
      } catch (jwtError) {
        logger.warn(
          `[Auth] Validation failed for ${req.path}: ${sbError?.message || (jwtError as Error).message}`
        );
        return next(new AppError('Invalid or expired token', 401));
      }
    }

    req.user = {
      ...user,
      role,
      fullName,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const authenticateOptional = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const {
      data: { user: sbUser },
      error: sbError,
    } = await supabase.auth.getUser(token);

    if (sbUser && !sbError) {
      const cacheKey = `user_profile:${sbUser.id}`;
      let cachedProfile: any = null;

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
          req.user = {
            ...sbUser,
            role: 'user',
            fullName: sbUser.email?.split('@')[0],
          };
        }
      }
    } else {
      // Try local JWT fallback
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'user',
          fullName: 'Main Admin',
        };
      } catch (jwtErr) {
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
        console.warn(
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
