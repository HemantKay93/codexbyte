import { Request, Response, NextFunction } from 'express';
import { supabase, getAdminClient } from '../config/supabase.js';
import { AppError } from './error.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }

  const token = authHeader.split(' ')[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return next(new AppError('Invalid or expired token', 401));
  }

  // Fetch role once and cache in req.user
  const admin = await getAdminClient();
  const { data: profile } = await admin
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  req.user = {
    ...user,
    role: profile?.role || 'user',
    fullName: profile?.full_name || user.email?.split('@')[0],
  };

  next();
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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
  };
};
