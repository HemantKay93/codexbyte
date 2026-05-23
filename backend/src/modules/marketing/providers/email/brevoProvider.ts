import axios, { AxiosInstance } from 'axios';
import { IProvider, SendPayload, ProviderResponse } from '../IProvider.js';
import logger from '../../../../services/logger.js';

export class BrevoProvider implements IProvider {
  private client: AxiosInstance | null = null;
  private fromAddress: string = 'noreply@byteevolvr.com';

  async initialize(config: any): Promise<void> {
    if (!config.brevoApiKey) {
      throw new Error('Brevo API Key is missing');
    }

    this.client = axios.create({
      baseURL: 'https://api.brevo.com/v3',
      headers: {
        'api-key': config.brevoApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (config.defaultFromAddress) {
      this.fromAddress = config.defaultFromAddress;
    }
    logger.info('[BrevoProvider] Initialized successfully');
  }

  async send(payload: SendPayload): Promise<ProviderResponse> {
    if (!this.client) throw new Error('BrevoProvider not initialized');

    try {
      const toList = Array.isArray(payload.to) ? payload.to : [payload.to];
      
      const response = await this.client.post('/smtp/email', {
        sender: { email: this.fromAddress },
        to: toList.map((email) => ({ email })),
        subject: payload.subject || 'Notification from ByteEvolvr',
        htmlContent: payload.body,
      });

      return { success: true, messageId: response.data.messageId };
    } catch (err: any) {
      logger.error('[BrevoProvider] Send error:', err?.response?.data || err.message);
      return { success: false, error: err?.response?.data?.message || err.message };
    }
  }

  async sendBulk(payloads: SendPayload[]): Promise<ProviderResponse[]> {
    if (!this.client) throw new Error('BrevoProvider not initialized');

    // Brevo doesn't have a simple bulk API for dynamic bodies in the exact same format as Resend,
    // but we can send them sequentially or via batches. For now, sequential Promise.all is fine.
    try {
      const promises = payloads.map((p) => this.send(p));
      return await Promise.all(promises);
    } catch (err: any) {
      logger.error('[BrevoProvider] Unexpected bulk error:', err);
      return payloads.map(() => ({ success: false, error: err.message }));
    }
  }
}
