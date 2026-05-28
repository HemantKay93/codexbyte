import axios, { AxiosInstance } from 'axios';

import logger from '../../services/logger.js';

import { IProvider, SendMessagePayload, SendMessageResult } from './IProvider.js';

export class BrevoProvider implements IProvider {
  public readonly name = 'brevo-email';
  private client: AxiosInstance | null = null;
  private fromAddress: string = 'noreply@byteevolvr.com';

  async initialize(): Promise<void> {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      logger.warn('[BrevoProvider] Brevo API Key is missing');
    } else {
      this.client = axios.create({
        baseURL: 'https://api.brevo.com/v3',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
        },
      });
      logger.info('[BrevoProvider] Initialized successfully');
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResult> {
    if (!this.client) {
      return {
        success: false,
        error: 'BrevoProvider not initialized',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const toList = Array.isArray(payload.to) ? payload.to : [payload.to];

      const response = await this.client.post('/smtp/email', {
        sender: { email: this.fromAddress },
        to: toList.map((email: string) => ({ email })),
        subject: payload.subject || 'Notification from ByteEvolvr',
        htmlContent: payload.content,
      });

      return {
        success: true,
        messageId: response.data.messageId,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('[BrevoProvider] Send error:', err?.response?.data || err.message);
      return {
        success: false,
        error: err?.response?.data?.message || err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async isHealthy(): Promise<boolean> {
    return this.client !== null;
  }
}
