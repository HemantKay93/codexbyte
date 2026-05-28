import { EventEmitter } from 'events';

import logger from '../../services/logger.js';

import { DomainEvents, DomainEventPayload } from './events.js';

class EventBus extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners to avoid warnings in a large app
    this.setMaxListeners(50);
  }

  /**
   * Publish a strongly-typed domain event
   */
  public publish<K extends DomainEvents>(event: K, payload: DomainEventPayload[K]): void {
    logger.info(`[EventBus] Publishing event: ${event}`, { payload });
    this.emit(event, payload);
  }

  /**
   * Subscribe to a strongly-typed domain event
   */
  public subscribe<K extends DomainEvents>(
    event: K,
    handler: (payload: DomainEventPayload[K]) => void | Promise<void>
  ): void {
    this.on(event, async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`[EventBus] Error handling event ${event}:`, error);
      }
    });
  }
}

// Export a singleton instance of the EventBus
export const eventBus = new EventBus();
