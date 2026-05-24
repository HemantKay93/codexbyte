import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import logger from '../services/logger.js';
import { WhatsAppRepository } from '../modules/whatsapp/whatsapp.repository.js';
import { MetaWhatsAppProvider } from '../core/providers/MetaWhatsAppProvider.js';
import { CMSService } from '../modules/cms/cms.service.js';

const whatsappRepo = new WhatsAppRepository();
const metaWhatsAppProvider = new MetaWhatsAppProvider();

export const whatsappWorker = new Worker(
  'whatsapp-queue',
  async (job: Job) => {
    // Handle remote control commands
    if (job.name === 'control') {
      return { success: true };
    }

    const { to, payload, jobId } = job.data;
    logger.info(`[WhatsApp Worker] Processing job ${job.id} to send message to ${to}`);

    try {
      // Re-fetch config dynamically per job
      const currentSettings = await CMSService.getContent('global');
      const currentWaConfig =
        currentSettings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};

      const isCloudApi = !!(currentWaConfig.accessToken && currentWaConfig.phoneNumberId);

      if (!isCloudApi) {
        throw new Error('WhatsApp Cloud API is not configured in settings.');
      }

      // Hot-init provider with latest credentials from CMS
      await metaWhatsAppProvider.initialize({
        accessToken: currentWaConfig.accessToken,
        phoneNumberId: currentWaConfig.phoneNumberId,
      });

      const result = await metaWhatsAppProvider.sendMessage({
        to: to,
        content: payload.content || '',
        metadata: payload,
      });

      if (!result.success) throw new Error(result.error);

      // Update DB Status
      if (jobId) await whatsappRepo.updateMessageStatus(jobId, 'sent');

      return { success: true, messageId: result.messageId };
    } catch (err: any) {
      logger.error(`[WhatsApp Worker] Failed to send message:`, err);
      if (jobId) await whatsappRepo.updateMessageStatus(jobId, 'failed', err.message);
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 5,
    stalledInterval: 300_000, // Check stalled jobs every 5 min (default: 30s)
    lockDuration: 600_000, // Hold job lock for 10 min
    removeOnComplete: { count: 100 }, // Keep only last 100 completed jobs
    removeOnFail: { count: 500 }, // Keep only last 500 failed jobs
  }
);

whatsappWorker.on('failed', (job, err) => {
  logger.error(`[WhatsApp Worker] Job ${job?.id} failed in queue:`, err);
});
