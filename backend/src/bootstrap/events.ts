import { initializeEventSubscribers } from '../core/events/EventSubscriber.js';
import logger from '../services/logger.js';

export function bootstrapEvents() {
  logger.info('[Bootstrap] Initializing domain event subscribers...');
  initializeEventSubscribers();
}
