import { CampaignRepository } from '../campaign.repository.js';
import { CampaignPayload } from '../../../core/contracts/index.js';
import { CampaignState } from '../../../core/fsm/CampaignStateMachine.js';

export class CampaignStateService {
  private campaignRepo: CampaignRepository;

  constructor() {
    this.campaignRepo = new CampaignRepository();
  }

  async getCampaigns(page: number, limit: number) {
    return this.campaignRepo.getCampaigns(page, limit);
  }

  async createCampaignRecord(payload: CampaignPayload) {
    return this.campaignRepo.createCampaign({
      name: payload.name,
      type: payload.channel,
      status: payload.scheduledFor ? 'scheduled' : 'draft',
      segment_id: payload.segmentId,
      template_id: payload.templateId,
      custom_content: payload.content,
      scheduled_at: payload.scheduledFor,
    });
  }

  async saveRecipients(recipients: any[]) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (recipients.length > 0) {
      await this.campaignRepo.insertRecipients(recipients);
    }
  }
  // eslint-disable-line @typescript-eslint/no-explicit-any
  async updateCampaignStatus(campaignId: string, status: CampaignState, updates: any = {}) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    await this.campaignRepo.updateCampaignStatus(campaignId, status, updates);
  }
}
