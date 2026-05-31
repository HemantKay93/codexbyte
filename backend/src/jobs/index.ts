import { Worker, Job } from 'bullmq';

import { redis } from '../config/redis.js';
import { NotificationService } from '../services/notificationService.js';
import { EmailService } from '../services/email.js';
import { AnalyticsService } from '../services/analyticsService.js';
import logger from '../services/logger.js';
import { WhatsAppRepository } from '../modules/whatsapp/whatsapp.repository.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars
import {
  emailQueue,
  notificationQueue,
  analyticsQueue,
  marketingAutomationQueue,
  whatsappQueue,
} from '../core/queues/index.js';
import { SocketGateway } from '../core/notifications/SocketGateway.js';

import { automationWorker } from './automation.worker.js';
import { whatsappWorker } from './whatsapp.worker.js';

// Define Workers
// REDIS OPTIMISATION: stalledInterval controls how often BullMQ polls for stalled jobs.
// Default is 30s which generates many Redis commands. We set it to 300s (5 min).
// lockDuration must be larger than stalledInterval.
const WORKER_OPTIONS = {
  skipVersionCheck: true, connection: redis,
  stalledInterval: 300_000, // Check for stalled jobs every 5 min (default: 30s)
  lockDuration: 600_000, // Hold job lock for 10 min
  drainDelay: 60, // Poll every 60s when queue is empty (was 10s).
  // At 10s: 5 workers × 6 polls/min × 60×24×30 = ~1,296,000 cmds/month ❌
  // At 60s: 5 workers × 1 poll/min × 60×24×30 = ~216,000 cmds/month ✅
  removeOnComplete: { count: 100 }, // Keep only last 100 completed jobs in Redis
  removeOnFail: { count: 500 }, // Keep only last 500 failed jobs
};

export const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    const { to, subject, html } = job.data;
    logger.info(`[Job] Sending email to ${to}...`);
    try {
      await EmailService.sendEmail(to, subject, html);
    } catch (err) {
      logger.error(`[Job] Email failed for ${to}:`, err);
      throw err;
    }
  },
  WORKER_OPTIONS
);

export const notificationWorker = new Worker(
  'notification-queue',
  async (job: Job) => {
    const { title, message, type, priority } = job.data;
    logger.info(`[Job] Creating system notification: ${title}`);
    try {
      await NotificationService.send({ title, message, type, priority });
    } catch (err) {
      logger.error(`[Job] Notification failed:`, err);
    }
  },
  WORKER_OPTIONS
);

export const analyticsWorker = new Worker(
  'analytics-queue',
  async (job: Job) => {
    const { type, payload } = job.data;
    logger.info(`[Job] Processing analytics event: ${type}`);
    try {
      await AnalyticsService.recordEvent(type, payload);
      logger.info(`[Analytics] Successfully processed event: ${type}`);
    } catch (err) {
      logger.error(`[Job] Analytics event failed:`, err);
      throw err;
    }
  },
  WORKER_OPTIONS
);

// Dead-Letter Queue Logic
const setupDLQ = (worker: Worker) => {
  worker.on('failed', async (job: Job | undefined, err: Error) => {
    if (!job) return;

    // Check if it's permanently failed (exhausted retries)
    if (job.attemptsMade >= (job.opts.attempts || 1)) {
      logger.error(`[DLQ] Job ${job.id} in ${job.name} permanently failed. Moving to DLQ.`);
      try {
        const { getAdminClient } = await import('../config/supabase.js');
        const admin = await getAdminClient();

        await admin.from('dlq_jobs').insert({
          queue_name: worker.name,
          job_name: job.name,
          payload: job.data,
          error_message: err.message,
          stack_trace: err.stack,
          status: 'unresolved',
        });
        logger.info(`[DLQ] Job ${job.id} successfully recorded in dlq_jobs table.`);
      } catch (dlqErr) {
        logger.error(`[DLQ] Failed to record dead-letter job:`, dlqErr);
      }
    }
  });
};

setupDLQ(emailWorker);
setupDLQ(notificationWorker);
setupDLQ(analyticsWorker);
setupDLQ(automationWorker);
setupDLQ(whatsappWorker);

import { whatsappIngestionWorker, emailIngestionWorker } from './support-ingestion.worker.js';
import { whatsappIngestionQueue, emailIngestionQueue, supportSlaQueue } from '../core/queues/index.js';

setupDLQ(whatsappIngestionWorker);
setupDLQ(emailIngestionWorker);

// Telemetry loop for Admin Panel Dashboard
const queues = [
  emailQueue,
  notificationQueue,
  analyticsQueue,
  marketingAutomationQueue,
  whatsappQueue,
  whatsappIngestionQueue,
  emailIngestionQueue,
  supportSlaQueue
];

// Telemetry broadcasts queue stats to the admin panel via WebSocket.
// IMPORTANT: Reduced from 5s to 60s to stay within Upstash 500k commands/month free tier.
// At 60s: 5 queues × 4 cmds × 1/min × 60 × 24 × 30 = ~43,200 cmds/month.
const telemetryInterval = setInterval(async () => {
  for (const q of queues) {
    try {
      const counts = await q.getJobCounts();
      SocketGateway.broadcastQueueStatus(q.name, {
        waiting: counts.waiting,
        active: counts.active,
        failed: counts.failed,
        completed: counts.completed,
      });
      // eslint-disable-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // eslint-disable-line @typescript-eslint/no-unused-vars
      // Ignore if redis goes down temporarily
    }
  }
}, 60_000); // 60 seconds — was 5000ms, reduced to save Redis commands

// Graceful shutdown
export const shutdownJobs = async () => {
  clearInterval(telemetryInterval);
  await emailQueue.close();
  await notificationQueue.close();
  await whatsappQueue.close();
  await analyticsQueue.close();
  await marketingAutomationQueue.close();
  await whatsappIngestionQueue.close();
  await emailIngestionQueue.close();
  await supportSlaQueue.close();
  await emailWorker.close();
  await notificationWorker.close();
  await analyticsWorker.close();
  await automationWorker.close();
  await whatsappWorker.close();
  await whatsappIngestionWorker.close();
  await emailIngestionWorker.close();
};

logger.info('[Jobs] Background workers initialized. Queue telemetry active.');
