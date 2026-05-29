import { Resend } from 'resend';

import logger from '../../services/logger.js';

import { IProvider, SendMessagePayload, SendMessageResult } from './IProvider.js';

export class ResendEmailProvider implements IProvider {
  public readonly name = 'resend-email';
  private client: Resend | null = null;

  async initialize(config?: any): Promise<void> {
    const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;
    if (apiKey) {
      this.client = new Resend(apiKey);
      logger.info('[ResendEmailProvider] Initialized successfully');
    } else {
      logger.warn('[ResendEmailProvider] Missing API KEY, provider running in mock mode');
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResult> {
    if (!this.client) {
      logger.info(
        `[ResendEmailProvider MOCK] Would send email to ${payload.to} with subject: ${payload.subject}`
      );
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const { data, error } = await this.client.emails.send({
        from: 'ByteEvolvr <noreply@byteevolvr.com>',
        to: payload.to,
        subject: payload.subject || 'ByteEvolvr Notification',
        html: payload.content,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        messageId: data?.id,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error(`[ResendEmailProvider] Failed to send email to ${payload.to}:`, err);
      return {
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.client) return false;
    try {
      // Perform a lightweight API call to verify the key works
      const { error } = await this.client.domains.list();
      return !error;
    } catch (e) {
      return false;
    }
  }
}
