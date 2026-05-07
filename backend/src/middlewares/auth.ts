import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { AppError } from './error.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return next(new AppError('Invalid or expired token', 401));
  }

  req.user = user;
  next();
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile || !roles.includes(profile.role)) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    next();
  };
};
