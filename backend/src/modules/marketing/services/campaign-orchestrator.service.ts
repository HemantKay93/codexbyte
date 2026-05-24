import { CampaignAudienceService } from './campaign-audience.service.js';
import { CampaignDispatchService } from './campaign-dispatch.service.js';
import { CampaignStateService } from './campaign-state.service.js';
import { CampaignPayload } from '../../../core/contracts/index.js';
import logger from '../../../services/logger.js';

export class CampaignOrchestratorService {
  private stateService: CampaignStateService;
  private audienceService: CampaignAudienceService;
  private dispatchService: CampaignDispatchService;

  constructor() {
    this.stateService = new CampaignStateService();
    this.audienceService = new CampaignAudienceService();
    this.dispatchService = new CampaignDispatchService();
  }

  async getCampaigns(page: number = 1, limit: number = 20) {
    return this.stateService.getCampaigns(page, limit);
  }

  async createCampaign(payload: CampaignPayload) {
    logger.info(`[CampaignOrchestrator] Orchestrating campaign: ${payload.name}`);

    // 1. Create State
    const campaign = await this.stateService.createCampaignRecord(payload);

    // 2. Resolve Audience
    const recipients = await this.audienceService.resolveRecipients(campaign.id, payload);
    await this.stateService.saveRecipients(recipients);

    // Update state with recipient count
    await this.stateService.updateCampaignStatus(campaign.id, campaign.status, {
      total_recipients: recipients.length,
    });
    campaign.total_recipients = recipients.length;

    // 3. Dispatch
    if (!payload.scheduledFor || new Date(payload.scheduledFor) <= new Date()) {
      await this.stateService.updateCampaignStatus(campaign.id, 'queued');
      await this.dispatchService.dispatchCampaign(campaign.id);
    }

    return campaign;
  }

  async enqueueCampaign(campaignId: string) {
    logger.info(`[CampaignOrchestrator] Manual enqueue for campaign: ${campaignId}`);
    await this.stateService.updateCampaignStatus(campaignId, 'queued');
    await this.dispatchService.dispatchCampaign(campaignId);
  }
}
