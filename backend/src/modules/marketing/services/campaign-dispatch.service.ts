import { Queue } from 'bullmq';

import { redis } from '../../../config/redis.js';
import logger from '../../../services/logger.js';

export class CampaignDispatchService {
  private campaignQueue: Queue;

  constructor() {
    this.campaignQueue = new Queue('marketing-campaigns', {
      skipVersionCheck: true,
      connection: redis,
    });
  }

  async dispatchCampaign(campaignId: string) {
    logger.info(`[CampaignDispatchService] Enqueuing campaign: ${campaignId}`);

    await this.campaignQueue.add(
      'process-campaign',
      { campaignId },
      {
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }
}
