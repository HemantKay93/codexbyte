import { Request, Response, NextFunction } from 'express';

import logger from '../services/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    const traceId = (req as any).traceId;
    const correlationId = (req as any).correlationId;
    const tenantId = (req as any).user?.tenant_id || 'system';
    const userId = (req as any).user?.id || 'anonymous';

    const meta = {
      metadata: {
        traceId,
        correlationId,
        tenantId,
        userId,
        durationMs: duration,
      },
    };

    if (statusCode >= 500) {
      logger.error(`[API] ${message}`, meta);
    } else if (statusCode >= 400) {
      logger.warn(`[API] ${message}`, meta);
    } else {
      logger.info(`[API] ${message}`, meta);
    }
  });

  next();
};
