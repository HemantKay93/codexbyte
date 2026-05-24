import axios from 'axios';
import { IProvider, SendMessagePayload, SendMessageResult } from './IProvider.js';
import logger from '../../services/logger.js';

export class MetaWhatsAppProvider implements IProvider {
  public readonly name = 'meta-whatsapp';
  private accessToken: string | null = null;
  private phoneNumberId: string | null = null;

  async initialize(config?: any): Promise<void> {
    // In the future, fetch these from DB instead of strictly from .env
    this.accessToken = config?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || null;
    this.phoneNumberId = config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || null;

    if (!this.accessToken || !this.phoneNumberId) {
      logger.warn('[CloudApiProvider] Initialized without credentials. Messages will fail.');
    } else {
      logger.info('[CloudApiProvider] Initialized successfully.');
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      return {
        success: false,
        error: 'Missing Cloud API Credentials',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

      const data: any = {
        messaging_product: 'whatsapp',
        to: payload.to,
      };

      const meta = payload.metadata || {};

      if (meta.type === 'template') {
        data.type = 'template';
        data.template = {
          name: meta.templateId,
          language: { code: 'en_US' }, // TODO: dynamically map this
        };
      } else if (meta.type === 'image' && meta.mediaUrl) {
        data.type = 'image';
        data.image = { link: meta.mediaUrl };
        if (payload.content) data.image.caption = payload.content;
      } else {
        data.type = 'text';
        data.text = { body: payload.content || '' };
      }

      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        messageId: response.data?.messages?.[0]?.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error(
        '[MetaWhatsAppProvider] Error sending message:',
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async isHealthy(): Promise<boolean> {
    return this.accessToken !== null && this.phoneNumberId !== null;
  }
}
