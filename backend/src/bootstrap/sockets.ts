import { Server } from 'http';

import { initSockets } from '../sockets/index.js';
import logger from '../services/logger.js';

export function bootstrapSockets(httpServer: Server) {
  logger.info('[Bootstrap] Initializing WebSockets...');
  initSockets(httpServer);
}
