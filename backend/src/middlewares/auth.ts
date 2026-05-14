import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase, getAdminClient } from '../config/supabase.js';
import { AppError } from './error.js';
import logger from '../services/logger.js';

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
      try {
        const admin = await getAdminClient();
        const { data: profile } = await admin
          .from('user_profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        role = profile?.role || 'user';
        fullName = profile?.full_name || user.email?.split('@')[0];
      } catch (profileError) {
        logger.error(`[Auth] Profile fetch failed: ${profileError.message}`);
        // Fallback to basic user info
        role = 'user';
        fullName = user.email?.split('@')[0];
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
      try {
        const admin = await getAdminClient();
        const { data: profile } = await admin
          .from('user_profiles')
          .select('role, full_name')
          .eq('id', sbUser.id)
          .single();

        req.user = {
          ...sbUser,
          role: profile?.role || 'user',
          fullName: profile?.full_name || sbUser.email?.split('@')[0],
        };
      } catch (profileErr) {
        req.user = {
          ...sbUser,
          role: 'user',
          fullName: sbUser.email?.split('@')[0],
        };
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
