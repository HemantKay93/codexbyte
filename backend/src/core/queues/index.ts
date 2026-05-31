import { Queue } from 'bullmq';

import { redis } from '../../config/redis.js';

// Default job options shared by all queues.
// removeOnComplete/removeOnFail keep Redis memory lean at scale.
// At 10k users, without cleanup, Redis would accumulate thousands of job keys.
const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: { count: 100 }, // Keep last 100 completed jobs per queue
  removeOnFail: { count: 200 }, // Keep last 200 failed jobs per queue
  attempts: 3, // Retry 3 times before marking failed
  backoff: { type: 'exponential' as const, delay: 2000 }, // 2s, 4s, 8s
};

export const emailQueue = new Queue('email-queue', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const notificationQueue = new Queue('notification-queue', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const analyticsQueue = new Queue('analytics-queue', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, attempts: 1 }, // analytics failures are not retried
});

export const marketingAutomationQueue = new Queue('marketing-automation', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const whatsappQueue = new Queue('whatsapp-queue', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const whatsappIngestionQueue = new Queue('whatsapp-ingestion-queue', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const emailIngestionQueue = new Queue('email-ingestion-queue', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const supportSlaQueue = new Queue('support-sla-queue', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});
