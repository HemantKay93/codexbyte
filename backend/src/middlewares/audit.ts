import { Response, NextFunction } from 'express';

import { AuditService } from '../services/auditService.js';

import { AuthRequest } from './auth.js';

export const auditLog = (module: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (data: any) {
      // Log after response is sent
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditService.log({
          user_id: req.user?.id,
          action: action,
          module: module,
          entity_id: req.params.id || data.id,
          new_data: req.method !== 'GET' ? req.body : undefined,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};
