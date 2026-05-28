import { whatsappQueue } from '../../jobs/whatsapp.queue.js';
import logger from '../../services/logger.js';

import { WhatsAppMessagePayload } from './whatsapp.types.js';
import { WhatsAppRepository } from './whatsapp.repository.js';

const repository = new WhatsAppRepository();

export class WhatsAppService {
  /**
   * Enqueues a WhatsApp message to be sent asynchronously by the worker.
   */
  static async enqueueMessage(
    to: string,
    payload: Omit<WhatsAppMessagePayload, 'to'>,
    priority: number = 0
  ) {
    logger.info(`[WhatsAppService] Enqueueing message for ${to}`);

    // Create DB Record first for tracking
    const record = await repository.createMessageRecord({
      recipient: to,
      payload,
      status: 'queued',
    });

    const isServerlessOrProd =
      !!process.env.VERCEL || !!process.env.RENDER || process.env.NODE_ENV === 'production';

    if (isServerlessOrProd) {
      logger.info(
        `[WhatsAppService] Running in serverless/production environment. Processing synchronously to guarantee delivery.`
      );
      try {
        const { WhatsAppProviderFactory } =
          await import('../marketing/providers/whatsapp/whatsappProviderFactory.js');
        const providerFactory = new WhatsAppProviderFactory();
        await providerFactory.initializeProviders();

        let type: 'text' | 'media' | 'template' = 'text';
        if (payload.type === 'template') type = 'template';
        if (payload.type === 'image' || payload.type === 'document') type = 'media';

        const providerPayload: any = {
          to,
          content: payload.content || '',
          metadata: payload,
        };

        if (type === 'media') {
          providerPayload.mediaUrl = (payload as any).mediaUrl;
          providerPayload.caption = payload.content;
          providerPayload.fileName = (payload as any).fileName;
          providerPayload.mimeType = (payload as any).mimeType;
        } else if (type === 'template') {
          providerPayload.templateId = (payload as any).templateId;
          providerPayload.languageCode = (payload as any).languageCode;
          providerPayload.components = (payload as any).components;
        }

        const result = await providerFactory.sendWithFailover(providerPayload, type);

        if (!result.success) {
          logger.warn(`[WhatsAppService] Sync send failed with error: ${result.error}`);
          await repository.updateMessageStatus(record.id, 'failed', result.error);
        } else {
          logger.info(`[WhatsAppService] Sync send succeeded with ID: ${result.messageId}`);
          await repository.updateMessageStatus(record.id, 'sent');
          const admin = await import('../../config/supabase.js').then((m) => m.getAdminClient());
          await admin
            .from('whatsapp_messages')
            .update({
              provider_used: result.provider,
              external_id: result.messageId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', record.id);
        }
      } catch (error: any) {
        logger.error(`[WhatsAppService] Unhandled sync send error:`, error);
        await repository.updateMessageStatus(record.id, 'failed', error.message);
      }
      return record;
    }

    // Add to BullMQ for local / traditional daemon environments
    await whatsappQueue.add(
      'send-message',
      {
        jobId: record.id,
        to,
        payload: { ...payload, to },
      },
      {
        jobId: `wa-${record.id}`, // Dedup key: BullMQ will reject any duplicate with the same ID
        priority,
        attempts: 2, // 1 try + 1 retry — 3 was showing as 4 entries in queue
        backoff: { type: 'exponential', delay: 3000 },
      }
    );

    // Update DB with BullMQ Job ID
    return record;
  }

  static async getStatus() {
    return repository.getSystemStatus();
  }

  static async getLogs(page: number = 1, limit: number = 50) {
    return repository.getRecentMessages(page, limit);
  }
}
