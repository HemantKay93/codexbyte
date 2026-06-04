import crypto from 'crypto';

import { Request, Response, NextFunction } from 'express';

export const traceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const traceId = (req.headers['x-trace-id'] as string) || crypto.randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();

  (req as any).traceId = traceId;
  (req as any).correlationId = correlationId;

  res.setHeader('X-Trace-Id', traceId);
  res.setHeader('X-Correlation-Id', correlationId);

  next();
};
