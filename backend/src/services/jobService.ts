import { emailQueue, notificationQueue, analyticsQueue } from '../core/queues/index.js';
import { redis } from '../config/redis.js';

import { EmailService } from './email.js';
import { NotificationService } from './notificationService.js';
import logger from './logger.js';

export class JobService {
  private static isRedisAvailable(): boolean {
    return redis.status === 'ready';
  }

  static async sendEmail(to: string, subject: string, html: string) {
    if (this.isRedisAvailable()) {
      try {
        await emailQueue.add(
          'send-email',
          { to, subject, html },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
          }
        );
        logger.info(`[JobService] Email to ${to} queued.`);
        return;
      } catch (err) {
        logger.error('[JobService] Failed to queue email, falling back to sync:', err);
      }
    }

    // Fallback to synchronous sending
    logger.warn(`[JobService] Redis unavailable. Sending email to ${to} synchronously.`);
    return EmailService.sendEmail(to, subject, html);
  }

  static async sendNotification(data: {
    userId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    priority?: 'low' | 'medium' | 'high';
    metadata?: any;
  }) {
    if (this.isRedisAvailable()) {
      try {
        await notificationQueue.add('send-notification', data);
        logger.info(`[JobService] Notification "${data.title}" queued.`);
        return;
      } catch (err) {
        logger.error('[JobService] Failed to queue notification, falling back to sync:', err);
      }
    }

    // Fallback to synchronous sending
    logger.warn(
      `[JobService] Redis unavailable. Sending notification "${data.title}" synchronously.`
    );
    return NotificationService.send(data);
  }

  static async dispatchAnalyticsEvent(type: string, payload: Record<string, any>) {
    if (this.isRedisAvailable()) {
      try {
        await analyticsQueue.add(
          'record-event',
          { type, payload },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
          }
        );
        logger.info(`[JobService] Analytics event '${type}' queued.`);
        return;
      } catch (err) {
        logger.error('[JobService] Failed to queue analytics event:', err);
      }
    } else {
      logger.warn(`[JobService] Redis unavailable. Analytics event '${type}' ignored.`);
    }
  }
}
