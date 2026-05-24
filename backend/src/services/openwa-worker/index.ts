import 'dotenv/config';
import { Worker } from 'bullmq';
import { redis } from '../../config/redis.js';
import logger from '../logger.js';
import { whatsappWorkerService } from './workerService.js';
import { WhatsAppRepository } from '../../modules/whatsapp/whatsapp.repository.js';
import { MetaWhatsAppProvider } from '../../core/providers/MetaWhatsAppProvider.js';
import { CMSService } from '../../modules/cms/cms.service.js';

const whatsappRepo = new WhatsAppRepository();
const metaWhatsAppProvider = new MetaWhatsAppProvider();

async function bootstrap() {
  logger.info('======================================');
  logger.info('[WhatsApp Bot] Starting Standalone Service...');
  logger.info('======================================');

  try {
    // 1. Fetch config to determine active provider
    const settings = await CMSService.getContent('global');
    const waConfig = settings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
    const useCloudApi = !!(waConfig.accessToken && waConfig.phoneNumberId);

    if (useCloudApi) {
      logger.info('[WhatsApp Worker] Booting in Cloud API Mode. OpenWA is disabled.');
      await metaWhatsAppProvider.initialize();
    } else {
      logger.info('[WhatsApp Worker] Booting in Legacy OpenWA Mode.');
      await whatsappWorkerService.initialize();
    }

    // 2. Start the BullMQ Worker explicitly in this separate process
    const worker = new Worker(
      'whatsapp-queue',
      async (job) => {
        // Handle remote control commands
        if (job.name === 'control') {
          const { action } = job.data;
          if (action === 'restart') {
            await whatsappWorkerService.restart();
          } else if (action === 'generate_qr') {
            await whatsappWorkerService.generateQR();
          }
          return { success: true };
        }

        const { to, payload, jobId } = job.data;
        logger.info(`[WhatsApp Worker] Processing job ${job.id} to send message to ${to}`);
        try {
          // Re-fetch config dynamically per job in case it was updated
          const currentSettings = await CMSService.getContent('global');
          const currentWaConfig =
            currentSettings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
          const isCloudApi = !!(currentWaConfig.accessToken && currentWaConfig.phoneNumberId);

          let result;
          if (isCloudApi) {
            // Hot-init provider in case credentials changed
            await metaWhatsAppProvider.initialize();
            result = await metaWhatsAppProvider.sendMessage({
              to: to,
              content: payload.content || '',
              metadata: payload,
            });

            if (!result.success) throw new Error(result.error);
            // If Cloud API succeeds, we don't necessarily update status to 'sent' here because the Webhook will handle 'delivered'!
            // But we mark it sent as an intermediate step.
            if (jobId) await whatsappRepo.updateMessageStatus(jobId, 'sent');
            // If we have an external message ID, we should save it. We'll update by external ID in webhook.
            if (jobId && result.messageId) {
              // We would save the external ID here. For now, we update by job ID as sent.
            }
          } else {
            await whatsappWorkerService.sendMessage(to, payload);
            if (jobId) await whatsappRepo.updateMessageStatus(jobId, 'sent');
          }

          return { success: true };
        } catch (err: any) {
          logger.error(`[WhatsApp Worker] Failed to send message:`, err);
          if (jobId) await whatsappRepo.updateMessageStatus(jobId, 'failed', err.message);
          throw err;
        }
      },
      {
        connection: redis,
        concurrency: 1,
        limiter: {
          max: 1,
          duration: 3000,
        },
      }
    );

    worker.on('failed', (job, err) => {
      logger.error(`[WhatsApp Bot] Job ${job?.id} failed in queue:`, err);
    });

    logger.info('[WhatsApp Bot] Listening for outgoing messages on "whatsapp-queue"...');
  } catch (error) {
    logger.error('[WhatsApp Bot] Critical Error during startup:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('[WhatsApp Bot] Shutting down...');
  process.exit(0);
});

bootstrap();
