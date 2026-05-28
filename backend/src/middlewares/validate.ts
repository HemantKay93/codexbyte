import { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { AppError } from './error.js';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((err: any) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        return next(new AppError(message, 400));
      }
      return next(error);
    }
  };
};
