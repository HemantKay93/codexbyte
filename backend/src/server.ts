import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

import dotenv from 'dotenv';

import logger from './services/logger.js';
import { validateEnvironment } from './config/env.js';
import { createApp } from './bootstrap/app.js';
import { bootstrapWorkers } from './bootstrap/workers.js';
import { bootstrapSockets } from './bootstrap/sockets.js';
import { bootstrapEvents } from './bootstrap/events.js';
import { bootstrapTelemetry } from './bootstrap/telemetry.js';

// Environment Setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Run startup environment variable validation
validateEnvironment();

const PORT = process.env.PORT || 8080;

// Initialize telemetry/tracing
bootstrapTelemetry();

// Initialize domain event listeners
bootstrapEvents();

// Initialize background workers
bootstrapWorkers();

// Create Express Application
const app = createApp();
const httpServer = createServer(app);

// Initialize WebSockets
bootstrapSockets(httpServer);

// Start Server
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`🚀 Backend is LIVE!`);
  logger.info(`URL: http://0.0.0.0:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;
