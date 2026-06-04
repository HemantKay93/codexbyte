import { Response, NextFunction } from 'express';

import { RbacService } from '../services/rbacService.js';

import { AuthRequest } from './auth.js';
import { AppError } from './error.js';

export const requirePermission = (permissionString: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next(new AppError('Authentication required', 401));
      }

      const tenantId = user.tenant_id;
      const roleName = user.role;

      if (!tenantId || !roleName) {
        return next(new AppError('Invalid user context', 403));
      }

      const [resource, action] = permissionString.split(':');
      if (!resource || !action) {
        return next(new AppError(`Invalid permission format: ${permissionString}`, 500));
      }

      const hasAccess = await RbacService.hasPermission(tenantId, roleName, resource, action);

      if (!hasAccess) {
        return next(
          new AppError(`Forbidden: Missing required permission [${permissionString}]`, 403)
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
