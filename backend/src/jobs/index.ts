import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { NotificationService } from '../services/notificationService.js';
import { EmailService } from '../services/email.js';
import { AnalyticsService } from '../services/analyticsService.js';
import logger from '../services/logger.js';
import { WhatsAppRepository } from '../modules/whatsapp/whatsapp.repository.js';
import { automationWorker } from './automation.worker.js';
import {
  emailQueue,
  notificationQueue,
  analyticsQueue,
  marketingAutomationQueue,
  whatsappQueue,
} from '../core/queues/index.js';
import { SocketGateway } from '../core/notifications/SocketGateway.js';

// Define Workers
export const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    const { to, subject, html } = job.data;
    logger.info(`[Job] Sending email to ${to}...`);
    try {
      await EmailService.sendEmail(to, subject, html);
    } catch (err) {
      logger.error(`[Job] Email failed for ${to}:`, err);
      throw err; // BullMQ will retry based on config
    }
  },
  { connection: redis }
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
  { connection: redis }
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
  { connection: redis }
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

// Remove the internal whatsapp worker so it runs separately
// export const whatsappWorker = new Worker(...)

// Telemetry loop for Admin Panel Dashboard
const queues = [
  emailQueue,
  notificationQueue,
  analyticsQueue,
  marketingAutomationQueue,
  whatsappQueue,
];

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
    } catch (e) {
      // Ignore if redis goes down temporarily
    }
  }
}, 5000);

// Graceful shutdown
export const shutdownJobs = async () => {
  clearInterval(telemetryInterval);
  await emailQueue.close();
  await notificationQueue.close();
  await whatsappQueue.close();
  await analyticsQueue.close();
  await marketingAutomationQueue.close();
  await emailWorker.close();
  await notificationWorker.close();
  await analyticsWorker.close();
  await automationWorker.close();
};

logger.info('[Jobs] Background workers initialized. Queue telemetry active.');
