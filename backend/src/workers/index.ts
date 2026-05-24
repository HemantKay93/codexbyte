import { CampaignWorker } from './campaign.worker.js';
import logger from '../services/logger.js';

export function initializeWorkers() {
  logger.info('[Workers] Initializing standardized workers...');

  const campaignWorker = new CampaignWorker();

  return {
    campaignWorker,
  };
}
