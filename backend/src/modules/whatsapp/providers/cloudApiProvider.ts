import axios from 'axios';
import { IWhatsAppProvider } from './IWhatsAppProvider.js';
import { WhatsAppMessagePayload } from '../whatsapp.types.js';
import logger from '../../../services/logger.js';

export class CloudApiProvider implements IWhatsAppProvider {
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

  async sendMessage(to: string, payload: WhatsAppMessagePayload): Promise<{ messageId?: string, success: boolean, error?: any }> {
    if (!this.accessToken || !this.phoneNumberId) {
      return { success: false, error: 'Missing Cloud API Credentials' };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      
      let data: any = {
        messaging_product: 'whatsapp',
        to: to,
      };

      if (payload.type === 'template') {
        data.type = 'template';
        data.template = {
          name: payload.templateId,
          language: { code: 'en_US' } // TODO: dynamically map this
        };
      } else if (payload.type === 'image' && payload.mediaUrl) {
        data.type = 'image';
        data.image = { link: payload.mediaUrl };
        if (payload.content) data.image.caption = payload.content;
      } else {
        data.type = 'text';
        data.text = { body: payload.content || '' };
      }

      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data?.messages?.[0]?.id
      };
    } catch (error: any) {
      logger.error('[CloudApiProvider] Error sending message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getStatus(): Promise<{ status: string, details?: any }> {
    return {
      status: (this.accessToken && this.phoneNumberId) ? 'connected' : 'disconnected',
      details: { provider: 'cloud_api' }
    };
  }
}
