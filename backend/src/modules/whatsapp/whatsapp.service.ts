import { whatsappQueue } from '../../jobs/whatsapp.queue.js';
import { WhatsAppMessagePayload } from './whatsapp.types.js';
import { WhatsAppRepository } from './whatsapp.repository.js';
import logger from '../../services/logger.js';

const repository = new WhatsAppRepository();

export class WhatsAppService {
  /**
   * Enqueues a WhatsApp message to be sent asynchronously by the worker.
   */
  static async enqueueMessage(to: string, payload: Omit<WhatsAppMessagePayload, 'to'>, priority: number = 0) {
    logger.info(`[WhatsAppService] Enqueueing message for ${to}`);
    
    // Create DB Record first for tracking
    const record = await repository.createMessageRecord({
      recipient: to,
      payload,
      status: 'queued'
    });

    // Add to BullMQ — use record.id as the unique jobId to prevent duplicates
    await whatsappQueue.add(
      'send-message',
      {
        jobId: record.id,
        to,
        payload: { ...payload, to }
      },
      {
        jobId: `wa-${record.id}`, // Dedup key: BullMQ will reject any duplicate with the same ID
        priority,
        attempts: 2,             // 1 try + 1 retry — 3 was showing as 4 entries in queue
        backoff: { type: 'exponential', delay: 3000 }
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
