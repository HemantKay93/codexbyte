import { Worker, Job } from 'bullmq';

import { redis } from '../config/redis.js';
import logger from '../services/logger.js';
import { WhatsAppRepository } from '../modules/whatsapp/whatsapp.repository.js';
import { WhatsAppProviderFactory } from '../modules/marketing/providers/whatsapp/whatsappProviderFactory.js';

const whatsappRepo = new WhatsAppRepository();
const providerFactory = new WhatsAppProviderFactory();

export const whatsappWorker = new Worker(
  'whatsapp-queue',
  async (job: Job) => {
    // eslint-disable-line complexity
    // eslint-disable-line complexity
    // Handle remote control commands
    if (job.name === 'control') {
      return { success: true };
    }

    const { to, payload, jobId, providerOverride } = job.data;
    logger.info(`[WhatsApp Worker] Processing job ${job.id} to send message to ${to}`);

    try {
      // 1. Initialize/Re-fetch provider configs from DB
      await providerFactory.initializeProviders();

      // 2. Identify message type
      let type: 'text' | 'media' | 'template' = 'text';
      if (payload.type === 'template') type = 'template';
      if (payload.type === 'image' || payload.type === 'document') type = 'media';

      // 3. Prepare unified payload
      // eslint-disable-line @typescript-eslint/no-explicit-any
      const providerPayload: any = {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        to,
        content: payload.content || '',
        metadata: payload,
      };

      if (type === 'media') {
        providerPayload.mediaUrl = payload.mediaUrl;
        providerPayload.caption = payload.content;
        providerPayload.fileName = payload.fileName;
        providerPayload.mimeType = payload.mimeType;
      } else if (type === 'template') {
        providerPayload.templateId = payload.templateId;
        providerPayload.languageCode = payload.languageCode;
        providerPayload.components = payload.components;
      }

      // 4. Send via Factory (automatically handles failover)
      const result = await providerFactory.sendWithFailover(
        providerPayload,
        type,
        providerOverride
      );

      if (!result.success) {
        // Validation / Invalid Recipient check (non-existent WhatsApp number)
        const isValidationFailure =
          result.error?.includes('not registered on WhatsApp') ||
          result.error?.includes('exists:false') ||
          result.error?.includes('invalid number') ||
          result.error?.includes('exists is false');

        if (isValidationFailure) {
          logger.warn(
            `[WhatsApp Worker] Recipient validation failed for ${to}: ${result.error}. Resolving job gracefully as permanently failed.`
          );
          if (jobId) {
            await whatsappRepo.updateMessageStatus(jobId, 'failed', result.error);
          }
          return {
            success: false,
            status: 'invalid_recipient',
            error: result.error,
            providerUsed: result.provider,
          };
        }

        throw new Error(result.error || 'Unknown provider error');
      }

      // 5. Update Legacy DB Status (Optional, keeping for dashboard backward compatibility)
      if (jobId) {
        await whatsappRepo.updateMessageStatus(jobId, 'sent');
        // Update the new columns
        const admin = await import('../config/supabase.js').then((m) => m.getAdminClient());
        await admin
          .from('whatsapp_messages')
          .update({
            provider_used: result.provider,
            external_id: result.messageId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId);
      }

      // eslint-disable-line @typescript-eslint/no-explicit-any
      return { success: true, messageId: result.messageId, providerUsed: result.provider };
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error(`[WhatsApp Worker] Failed to send message:`, err);
      if (jobId) await whatsappRepo.updateMessageStatus(jobId, 'failed', err.message);
      throw err;
    }
  },
  {
    skipVersionCheck: true, connection: redis,
    concurrency: 5,
    stalledInterval: 300_000, // Check stalled jobs every 5 min (default: 30s)
    lockDuration: 600_000, // Hold job lock for 10 min
    drainDelay: 60, // Poll every 60s when idle — saves ~1M Redis commands/month vs 10s
    removeOnComplete: { count: 100 }, // Keep only last 100 completed jobs
    removeOnFail: { count: 500 }, // Keep only last 500 failed jobs
  }
);

whatsappWorker.on('failed', (job, err) => {
  logger.error(`[WhatsApp Worker] Job ${job?.id} failed in queue:`, err);
});
