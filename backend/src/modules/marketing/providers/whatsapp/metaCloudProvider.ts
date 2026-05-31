import axios from 'axios';

import logger from '../../../../services/logger.js';
import { env } from '../../../../config/env.js';


import {
  IWhatsAppProvider,
  ProviderResponse,
  WhatsAppMessagePayload,
  WhatsAppMediaPayload,
  WhatsAppTemplatePayload,
} from './IWhatsAppProvider.js';

export class MetaCloudProvider implements IWhatsAppProvider {
  public readonly name = 'meta';
  private accessToken: string | null = null;
  private phoneNumberId: string | null = null;

  async initialize(config?: any): Promise<void> {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    this.accessToken = config?.accessToken || env.WHATSAPP_ACCESS_TOKEN || null;
    this.phoneNumberId = config?.phoneNumberId || env.WHATSAPP_PHONE_NUMBER_ID || null;

    if (!this.accessToken || !this.phoneNumberId) {
      logger.warn('[MetaCloudProvider] Initialized without credentials. Messages will fail.');
    } else {
      logger.info('[MetaCloudProvider] Initialized successfully.');
    }
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<ProviderResponse> {
    if (!this.accessToken || !this.phoneNumberId) {
      return this.createErrorResponse('Missing Cloud API Credentials');
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      const data = {
        messaging_product: 'whatsapp',
        to: payload.to,
        type: 'text',
        text: { body: payload.content || '' },
      };

      const response = await axios.post(url, data, this.getHeaders());
      return this.createSuccessResponse(response.data?.messages?.[0]?.id);
      // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error(
        '[MetaCloudProvider] Error sending text message:',
        error.response?.data || error.message
      );
      return this.createErrorResponse(error.response?.data?.error?.message || error.message);
    }
  }

  async sendMedia(payload: WhatsAppMediaPayload): Promise<ProviderResponse> {
    if (!this.accessToken || !this.phoneNumberId) {
      return this.createErrorResponse('Missing Cloud API Credentials');
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

      // Basic detection for document vs image based on mimeType/url extension.
      // Assuming 'image' as default if not specified.
      const isDocument = payload.mimeType?.includes('pdf') || payload.fileName;
      const mediaType = isDocument ? 'document' : 'image';
      // eslint-disable-line @typescript-eslint/no-explicit-any

      const data: any = {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        messaging_product: 'whatsapp',
        to: payload.to,
        type: mediaType,
      };

      data[mediaType] = { link: payload.mediaUrl };
      if (payload.caption) data[mediaType].caption = payload.caption;
      if (payload.fileName && isDocument) data[mediaType].filename = payload.fileName;

      // eslint-disable-line @typescript-eslint/no-explicit-any
      const response = await axios.post(url, data, this.getHeaders());
      return this.createSuccessResponse(response.data?.messages?.[0]?.id);
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error(
        '[MetaCloudProvider] Error sending media message:',
        error.response?.data || error.message
      );
      return this.createErrorResponse(error.response?.data?.error?.message || error.message);
    }
  }

  async sendTemplate(payload: WhatsAppTemplatePayload): Promise<ProviderResponse> {
    if (!this.accessToken || !this.phoneNumberId) {
      return this.createErrorResponse('Missing Cloud API Credentials');
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

      const data = {
        messaging_product: 'whatsapp',
        to: payload.to,
        type: 'template',
        template: {
          name: payload.templateId,
          language: { code: payload.languageCode || 'en_US' },
          components: payload.components || [],
        },
      };
      // eslint-disable-line @typescript-eslint/no-explicit-any

      const response = await axios.post(url, data, this.getHeaders());
      return this.createSuccessResponse(response.data?.messages?.[0]?.id);
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error(
        '[MetaCloudProvider] Error sending template message:',
        error.response?.data || error.message
      );
      return this.createErrorResponse(error.response?.data?.error?.message || error.message);
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.accessToken || !this.phoneNumberId) return false;
    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}?fields=verified_name,display_phone_number`;
      const response = await axios.get(url, this.getHeaders());
      return !!response.data?.id;
    } catch (e) {
      logger.warn('[MetaCloudProvider] Health check failed:', e);
      return false;
    }
  }

  private getHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
  }

  private createSuccessResponse(messageId: string): ProviderResponse {
    return {
      success: true,
      provider: this.name,
      messageId,
      status: 'sent',
    };
  }

  private createErrorResponse(error: string): ProviderResponse {
    return {
      success: false,
      provider: this.name,
      error,
      status: 'failed',
    };
  }
}
