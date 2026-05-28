import { Response, NextFunction } from 'express';

import { RolePermissions, Permission } from '../config/permissions.js';

import { AuthRequest } from './auth.js';
import { AppError } from './error.js';

export const requirePermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError('Authentication required', 401));
    }

    const userPermissions = RolePermissions[user.role] || [];

    if (!userPermissions.includes(permission)) {
      return next(new AppError(`Forbidden: Missing required permission [${permission}]`, 403));
    }

    next();
  };
};
