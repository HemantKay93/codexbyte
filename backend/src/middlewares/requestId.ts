import crypto from 'node:crypto';

import { Request, Response, NextFunction } from 'express';

export interface CorrelatedRequest extends Request {
  id?: string;
}

export const requestIdCorrelation = (req: CorrelatedRequest, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
};
