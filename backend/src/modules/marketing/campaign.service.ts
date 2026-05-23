import { CampaignRepository } from './campaign.repository.js';
import { SegmentService } from './segment.service.js';
import { Queue } from 'bullmq';
import { redis } from '../../config/redis.js';
import logger from '../../services/logger.js';
import { AppError } from '../../middlewares/error.js';

export class CampaignService {
  private campaignRepo: CampaignRepository;
  private segmentService: SegmentService;
  private campaignQueue: Queue;

  constructor() {
    this.campaignRepo = new CampaignRepository();
    this.segmentService = new SegmentService();
    this.campaignQueue = new Queue('marketing-campaigns', { connection: redis });
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(page: number = 1, limit: number = 20) {
    return await this.campaignRepo.getCampaigns(page, limit);
  }

  /**
   * Create and prepare a new campaign
   * It will fetch audience segments and insert recipient records into campaign_recipients
   */
  async createCampaign(payload: any) {
    logger.info(`[CampaignService] Creating campaign: ${payload.name}`);

    // 1. Create the base campaign record
    const campaign = await this.campaignRepo.createCampaign({
      name: payload.name,
      type: payload.type,
      status: payload.scheduled_at ? 'scheduled' : 'draft',
      segment_id: payload.segment_id,
      template_id: payload.template_id,
      custom_content: payload.custom_content,
      scheduled_at: payload.scheduled_at,
    });

    // 2. Resolve audience segment if provided
    if (payload.segment_id) {
      const users = await this.segmentService.resolveSegmentUsers(payload.segment_id);
      
      const recipients = users.map(u => {
        let contact = '';
        if (payload.type === 'email') contact = u.email;
        else if (payload.type === 'whatsapp') contact = u.phone;
        // else push token
        
        return {
          campaign_id: campaign.id,
          user_id: u.id,
          contact_address: contact,
          status: 'queued',
          variables: { customer_name: u.metadata?.first_name || 'Customer' }
        };
      }).filter(r => r.contact_address); // filter out users without the required contact info

      // 3. Bulk insert recipients
      await this.campaignRepo.insertRecipients(recipients);

      // Update total count
      await this.campaignRepo.updateCampaignStatus(campaign.id, campaign.status, {
        total_recipients: recipients.length
      });
      
      campaign.total_recipients = recipients.length;
    }

    // 4. If not scheduled for later, enqueue immediately
    if (!payload.scheduled_at || new Date(payload.scheduled_at) <= new Date()) {
      await this.enqueueCampaign(campaign.id);
    }

    return campaign;
  }

  /**
   * Enqueue a campaign to be processed by the BullMQ worker
   */
  async enqueueCampaign(campaignId: string) {
    logger.info(`[CampaignService] Enqueuing campaign: ${campaignId}`);
    await this.campaignRepo.updateCampaignStatus(campaignId, 'queued');
    
    await this.campaignQueue.add(
      'process-campaign', 
      { campaignId }, 
      {
        removeOnComplete: true,
        removeOnFail: false
      }
    );
  }
}
