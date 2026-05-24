import { Worker, Job } from 'bullmq';
import { redis } from '../../config/redis.js';
import { CampaignRepository } from '../../modules/marketing/campaign.repository.js';
import { ProviderService } from '../../modules/marketing/providers/provider.service.js';
import { TemplateService } from '../../modules/marketing/template.service.js';
import { IProvider } from '../../core/providers/IProvider.js';
import { TemplateEngine } from '../../core/template/TemplateEngine.js';
import { SocketGateway } from '../../core/notifications/SocketGateway.js';
import logger from '../logger.js';

const campaignRepo = new CampaignRepository();

logger.info('[MarketingWorker] Starting marketing campaign processor...');

const worker = new Worker(
  'marketing-campaigns',
  async (job: Job) => {
    switch (job.name) {
      case 'process-campaign':
        return processCampaign(job);
      default:
        logger.warn(`[MarketingWorker] Unknown job name: ${job.name}`);
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 campaigns concurrently
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  }
);

worker.on('failed', (job, err) => {
  logger.error(`[MarketingWorker] Job ${job?.id} failed with error:`, err);
});

worker.on('completed', (job) => {
  logger.info(`[MarketingWorker] Job ${job.id} completed successfully`);
});

/**
 * Main function to process a bulk campaign
 */
async function processCampaign(job: Job) {
  const { campaignId } = job.data;
  logger.info(`[MarketingWorker] Processing campaign ${campaignId}`);

  try {
    // 1. Fetch Campaign Details
    const { data: campaigns } = await campaignRepo.getCampaigns(1, 1);
    const campaign = campaigns.find((c: any) => c.id === campaignId);

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    if (campaign.status === 'paused' || campaign.status === 'cancelled') {
      logger.info(`[MarketingWorker] Campaign ${campaignId} is ${campaign.status}, aborting.`);
      return;
    }

    await campaignRepo.updateCampaignStatus(campaignId, 'processing');

    // 2. Resolve the correct Provider
    let provider: IProvider;
    if (campaign.type === 'email') provider = await ProviderService.getEmailProvider();
    else if (campaign.type === 'whatsapp') provider = await ProviderService.getWhatsAppProvider();
    else if (campaign.type === 'push') provider = await ProviderService.getPushProvider();
    else throw new Error(`Unknown campaign type: ${campaign.type}`);

    // 3. Fetch Queued Recipients (Batching)
    const BATCH_SIZE = 100;
    let hasMore = true;
    let successCount = 0;
    let failCount = 0;

    while (hasMore) {
      const recipients = await campaignRepo.getRecipients(campaignId, 'queued', BATCH_SIZE);
      if (recipients.length === 0) {
        hasMore = false;
        break;
      }

      // Mark batch as processing
      for (const r of recipients) {
        await campaignRepo.updateRecipientStatus(r.id, 'processing');
      }

      // Prepare payloads
      const baseSubject = campaign.name;
      const baseContent = campaign.custom_content || 'No Content';

      const payloads = recipients.map((r: any) => {
        // Apply dynamic variable replacement using TemplateEngine
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

      // Use sendBulk if provider supports it, otherwise fallback to sequential send
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
          await campaignRepo.updateRecipientStatus(rec.id, 'sent', undefined, res.messageId);
          successCount++;
        } else {
          await campaignRepo.updateRecipientStatus(rec.id, 'failed', res.error);
          failCount++;
        }
      }

      // Update campaign stats
      await campaignRepo.updateCampaignStatus(campaignId, 'processing', {
        successful_deliveries: (campaign.successful_deliveries || 0) + successCount,
        failed_deliveries: (campaign.failed_deliveries || 0) + failCount,
      });
    }

    // Finished
    await campaignRepo.updateCampaignStatus(campaignId, 'completed', {
      finished_at: new Date().toISOString(),
    });

    SocketGateway.notifyCampaignSuccess(campaignId, campaign.name);

    logger.info(
      `[MarketingWorker] Campaign ${campaignId} completed. Success: ${successCount}, Fail: ${failCount}`
    );
  } catch (error: any) {
    logger.error(`[MarketingWorker] Error processing campaign ${campaignId}:`, error);
    await campaignRepo.updateCampaignStatus(campaignId, 'failed');
    SocketGateway.notifyCampaignFailure(campaignId, 'Unknown Campaign', error.message);
    throw error;
  }
}
