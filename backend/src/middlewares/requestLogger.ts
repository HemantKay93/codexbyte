import { Request, Response, NextFunction } from 'express';

import logger from '../services/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      logger.error(`[API] ${message}`);
    } else if (statusCode >= 400) {
      logger.warn(`[API] ${message}`);
    } else {
      // Avoid spamming too much in production unless debug is on, but for workflow maturation it's good to have.
      // We'll log all requests to info for now to get a baseline of operational visibility.
      logger.info(`[API] ${message}`);
    }
  });

  next();
};
