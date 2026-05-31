import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import logger from '../services/logger.js';
import { SupportInboxService } from '../modules/support/support.inbox.service.js';

const WORKER_OPTIONS = {
  skipVersionCheck: true, connection: redis,
  stalledInterval: 300_000,
  lockDuration: 600_000,
  drainDelay: 60,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
};

const supportInboxService = new SupportInboxService();

export const whatsappIngestionWorker = new Worker(
  'whatsapp-ingestion-queue',
  async (job: Job) => {
    logger.info(`[SupportWorker] Processing inbound WhatsApp from ${job.data.senderPhone}...`);
    try {
      await supportInboxService.processInboundWhatsApp(job.data);
    } catch (err) {
      logger.error(`[SupportWorker] WhatsApp ingestion failed:`, err);
      throw err;
    }
  },
  WORKER_OPTIONS
);

export const emailIngestionWorker = new Worker(
  'email-ingestion-queue',
  async (job: Job) => {
    logger.info(`[SupportWorker] Processing inbound Email...`);
    try {
      await supportInboxService.processInboundEmail(job.data);
    } catch (err) {
      logger.error(`[SupportWorker] Email ingestion failed:`, err);
      throw err;
    }
  },
  WORKER_OPTIONS
);
