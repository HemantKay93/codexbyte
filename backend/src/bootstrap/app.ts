import express, { Express } from 'express';

import { errorHandler } from '../middlewares/error.js';
import logger from '../services/logger.js';

import { bootstrapMiddleware } from './middleware.js';
import { bootstrapRoutes } from './routes.js';

export function createApp(): Express {
  logger.info('[Bootstrap] Creating Express Application...');
  const app = express();

  // 1. Mount Security & Core Middleware
  bootstrapMiddleware(app);

  // 2. Mount API Routes
  bootstrapRoutes(app);

  // 3. Global Error Handling (Must be last)
  app.use(errorHandler);

  return app;
}
