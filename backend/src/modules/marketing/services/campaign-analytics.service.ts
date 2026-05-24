import { CampaignRepository } from '../campaign.repository.js';
import logger from '../../../services/logger.js';

export class CampaignAnalyticsService {
  private campaignRepo: CampaignRepository;

  constructor() {
    this.campaignRepo = new CampaignRepository();
  }

  async getCampaignStats(campaignId: string) {
    logger.info(`[CampaignAnalyticsService] Fetching stats for campaign: ${campaignId}`);
    // return this.campaignRepo.getCampaignStats(campaignId);
    return { sent: 0, delivered: 0, failed: 0 };
  }
}
