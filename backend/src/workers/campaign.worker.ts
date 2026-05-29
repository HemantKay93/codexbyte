import { Job } from 'bullmq';

import { CampaignPayload } from '../core/contracts/index.js';
import { CampaignRepository } from '../modules/marketing/campaign.repository.js';
import { ProviderService } from '../modules/marketing/providers/provider.service.js';
import { IProvider } from '../core/providers/IProvider.js';
import { TemplateEngine } from '../core/template/TemplateEngine.js';
import { SocketGateway } from '../core/notifications/SocketGateway.js';
import { ProviderHealthService } from '../modules/marketing/providers/provider-health.service.js';
import logger from '../services/logger.js';

import { BaseWorker } from './base.worker.js';

export class CampaignWorker extends BaseWorker<CampaignPayload> {
  private campaignRepo: CampaignRepository;

  constructor() {
    super('marketing-campaigns', {
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    });
    this.campaignRepo = new CampaignRepository();
  }

  async process(job: Job<CampaignPayload>) {
    if (job.name === 'process-campaign') {
      return this.processCampaign(job);
    }
    logger.warn(`[CampaignWorker] Unknown job name: ${job.name}`);
  }

  private async processCampaign(job: Job<CampaignPayload>) {
    // eslint-disable-line complexity
    // eslint-disable-line complexity
    const { campaignId } = job.data;
    logger.info(`[CampaignWorker] Processing campaign ${campaignId}`);

    try {
      // 1. Fetch Campaign Details
      const { data: campaigns } = await this.campaignRepo.getCampaigns(1, 1);
      // eslint-disable-line @typescript-eslint/no-explicit-any
      const campaign = campaigns.find((c: any) => c.id === campaignId);
      // eslint-disable-line @typescript-eslint/no-explicit-any

      if (!campaign) {
        throw new Error(`Campaign ${campaignId} not found`);
      }

      if (campaign.status === 'paused' || campaign.status === 'cancelled') {
        logger.info(`[CampaignWorker] Campaign ${campaignId} is ${campaign.status}, aborting.`);
        return;
      }

      await this.campaignRepo.updateCampaignStatus(campaignId, 'processing');

      // 2. Resolve the correct Provider
      let provider: IProvider;
      if (campaign.channel === 'email') provider = await ProviderService.getEmailProvider();
      else if (campaign.channel === 'whatsapp')
        provider = await ProviderService.getWhatsAppProvider();
      else if (campaign.channel === 'push') provider = await ProviderService.getPushProvider();
      else throw new Error(`Unknown campaign type: ${campaign.channel}`);

      // 3. Fetch Queued Recipients (Batching)
      const BATCH_SIZE = 100;
      let hasMore = true;
      let successCount = 0;
      let failCount = 0;

      while (hasMore) {
        const recipients = await this.campaignRepo.getRecipients(campaignId, 'queued', BATCH_SIZE);
        if (recipients.length === 0) {
          hasMore = false;
          break;
        }

        // Mark batch as processing
        for (const r of recipients) {
          await this.campaignRepo.updateRecipientStatus(r.id, 'processing');
        }

        // Prepare payloads
        const baseSubject = campaign.name;
        const baseContent = campaign.custom_content || 'No Content';
        // eslint-disable-line @typescript-eslint/no-explicit-any

        const payloads = recipients.map((r: any) => {
          // eslint-disable-line @typescript-eslint/no-explicit-any
          const finalSubject = TemplateEngine.render(baseSubject, r.variables || {});
          const finalContent = TemplateEngine.render(baseContent, r.variables || {});

          return {
            to: r.contact_address,
            subject: finalSubject,
            content: finalContent,
            metadata: {
              recipientId: r.id,
              campaignId: campaign.id,
            },
          };
        });

        // Send via provider
        let results;
        if (provider.sendBulk) {
          results = await provider.sendBulk(payloads);
        } else {
          results = [];
          for (const p of payloads) {
            results.push(await provider.sendMessage(p));
          }
        }

        // Update statuses
        for (let i = 0; i < results.length; i++) {
          const res = results[i];
          const rec = recipients[i];

          if (res.success) {
            await this.campaignRepo.updateRecipientStatus(rec.id, 'sent', undefined, res.messageId);
            await ProviderHealthService.recordSuccess(campaign.channel);
            successCount++;
          } else {
            await this.campaignRepo.updateRecipientStatus(rec.id, 'failed', res.error);
            await ProviderHealthService.recordError(campaign.channel);
            failCount++;
          }
        }

        // Update campaign stats
        await this.campaignRepo.updateCampaignStatus(campaignId, 'processing', {
          successful_deliveries: (campaign.successful_deliveries || 0) + successCount,
          failed_deliveries: (campaign.failed_deliveries || 0) + failCount,
        });
      }

      // Finished
      await this.campaignRepo.updateCampaignStatus(campaignId, 'completed', {
        finished_at: new Date().toISOString(),
      });

      SocketGateway.notifyCampaignSuccess(campaignId, campaign.name);

      logger.info(
        // eslint-disable-line @typescript-eslint/no-explicit-any
        `[CampaignWorker] Campaign ${campaignId} completed. Success: ${successCount}, Fail: ${failCount}`
      );
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error(`[CampaignWorker] Error processing campaign ${campaignId}:`, error);
      await this.campaignRepo.updateCampaignStatus(campaignId, 'failed');
      SocketGateway.notifyCampaignFailure(campaignId, 'Unknown Campaign', error.message);
      throw error;
    }
  }
}
