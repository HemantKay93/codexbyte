import { Response, NextFunction } from 'express';

import { AuditService } from '../services/auditService.js';

import { AuthRequest } from './auth.js';

export const auditLog = (module: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Capture tenant ID from authenticated user context
        const tenantId = req.user?.tenant_id;

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        AuditService.log({
          tenant_id: tenantId,
          user_id: req.user?.id,
          action: action,
          resource: module,
          resource_id: req.params.id || data?.id,
          metadata: req.method !== 'GET' ? req.body : undefined,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};
