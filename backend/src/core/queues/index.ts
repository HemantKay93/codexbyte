import { Queue } from 'bullmq';
import { redis } from '../../config/redis.js';

export const emailQueue = new Queue('email-queue', { connection: redis });
export const notificationQueue = new Queue('notification-queue', { connection: redis });
export const analyticsQueue = new Queue('analytics-queue', { connection: redis });
export const marketingAutomationQueue = new Queue('marketing-automation', { connection: redis });
export const whatsappQueue = new Queue('whatsapp-queue', { connection: redis });
