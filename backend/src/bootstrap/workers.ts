import logger from '../services/logger.js';
import { initializeWorkers as initModuleWorkers } from '../workers/index.js';

export function bootstrapWorkers() {
  if (process.env.ENABLE_WORKERS === 'true' || process.env.NODE_ENV !== 'production') {
    logger.info('[Bootstrap] Initializing background workers...');
    // We import jobs/index.js to start BullMQ workers
    import('../jobs/index.js').catch((err) => {
      logger.error('[Bootstrap] Failed to initialize jobs:', err);
    });

    // Initialize domain-specific module workers (e.g. CampaignWorker)
    initModuleWorkers();
  } else {
    logger.info(
      '[Bootstrap] Workers disabled (ENABLE_WORKERS !== "true"). Skipping worker initialization.'
    );
  }
}
