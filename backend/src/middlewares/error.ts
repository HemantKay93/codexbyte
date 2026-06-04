import { Request, Response, NextFunction } from 'express';

import logger from '../services/logger.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  // eslint-disable-line @typescript-eslint/no-explicit-any
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const traceId = (req as any).traceId;
  const correlationId = (req as any).correlationId;
  const tenantId = (req as any).user?.tenant_id || 'system';
  const userId = (req as any).user?.id || 'anonymous';

  logger.error(`${err.statusCode || 500} - ${err.message}`, {
    metadata: {
      traceId,
      correlationId,
      tenantId,
      userId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      stack: err.stack,
    },
  });

  if (env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      traceId,
      correlationId,
      error: err,
      stack: err.stack,
    });
  } else {
    // Production: Don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        traceId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        traceId,
      });
    }
  }
};

// eslint-disable-line @typescript-eslint/no-unsafe-function-type
export const catchAsync = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
