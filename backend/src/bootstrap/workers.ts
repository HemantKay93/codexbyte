import logger from '../services/logger.js';
import { initializeWorkers as initModuleWorkers } from '../workers/index.js';
import { env } from '../config/env.js';


export function bootstrapWorkers() {
  if (env.ENABLE_WORKERS === 'true' || env.NODE_ENV !== 'production') {
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
