import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import logger from '../services/logger.js';
import { WhatsAppRepository } from '../modules/whatsapp/whatsapp.repository.js';
import { MetaWhatsAppProvider } from '../core/providers/MetaWhatsAppProvider.js';
import { CMSService } from '../modules/cms/cms.service.js';

const whatsappRepo = new WhatsAppRepository();
const metaWhatsAppProvider = new MetaWhatsAppProvider();

// ─── In-Memory Config Cache (5 min) ─────────────────────────────────────────
// Without this, every queued message fetches CMS config from the DB.
// 1,000 messages/day = 1,000 unnecessary DB round-trips. Cache it instead.
interface WaConfigCache {
  config: any;
  expiresAt: number;
}
let waConfigCache: WaConfigCache | null = null;
const WA_CONFIG_CACHE_MS = 5 * 60 * 1000; // 5 minutes

const getWaConfig = async (): Promise<any> => {
  if (waConfigCache && Date.now() < waConfigCache.expiresAt) {
    return waConfigCache.config;
  }
  const settings = await CMSService.getContent('global');
  const config = settings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
  waConfigCache = { config, expiresAt: Date.now() + WA_CONFIG_CACHE_MS };
  return config;
};

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
      // Use cached config — avoids a DB round-trip on every message job
      const currentWaConfig = await getWaConfig();
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
