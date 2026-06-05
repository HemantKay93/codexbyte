import { createServer } from 'http';

import logger from './services/logger.js';
import { validateEnvironment } from './config/env.js';
import { createApp } from './bootstrap/app.js';
import { bootstrapWorkers } from './bootstrap/workers.js';
import { bootstrapSockets } from './bootstrap/sockets.js';
import { bootstrapEvents } from './bootstrap/events.js';
import { bootstrapTelemetry } from './bootstrap/telemetry.js';
import { env } from './config/env.js';

// Run startup environment variable validation
validateEnvironment();

const PORT = env.PORT || 8080;

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
httpServer.listen(Number(PORT), () => {
  logger.info(`🚀 Backend is LIVE!`);
  logger.info(`URL: http://0.0.0.0:${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;
