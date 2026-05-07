import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { NotificationService } from '../services/notificationService.js';
import { EmailService } from '../services/email.js';
import logger from '../services/logger.js';

// Define Queues
export const emailQueue = new Queue('email-queue', { connection: redis });
export const notificationQueue = new Queue('notification-queue', { connection: redis });

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
      await NotificationService.create(title, message, type, priority);
    } catch (err) {
      logger.error(`[Job] Notification failed:`, err);
    }
  },
  { connection: redis }
);

// Graceful shutdown
export const shutdownJobs = async () => {
  await emailQueue.close();
  await notificationQueue.close();
  await emailWorker.close();
  await notificationWorker.close();
};

logger.info('[Jobs] Background workers initialized.');
