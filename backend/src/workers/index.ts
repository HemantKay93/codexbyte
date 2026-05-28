import logger from '../services/logger.js';

import { CampaignWorker } from './campaign.worker.js';

export function initializeWorkers() {
  logger.info('[Workers] Initializing standardized workers...');

  const campaignWorker = new CampaignWorker();

  return {
    campaignWorker,
  };
}
