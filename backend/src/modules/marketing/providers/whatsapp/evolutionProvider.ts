import axios from 'axios';

import logger from '../../../../services/logger.js';

import {
  IWhatsAppProvider,
  ProviderResponse,
  WhatsAppMessagePayload,
  WhatsAppMediaPayload,
  WhatsAppTemplatePayload,
} from './IWhatsAppProvider.js';

export class EvolutionProvider implements IWhatsAppProvider {
  public readonly name = 'evolution';
  private baseUrl: string | null = null;
  private apiKey: string | null = null;
  private instanceName: string | null = null;

  async initialize(config?: any): Promise<void> {
    // Expected config: { baseUrl: 'https://wa.byteevolvr.com', apiKey: '...', instanceName: 'byteevolvr' }
    this.baseUrl = config?.baseUrl || null;
    this.apiKey = config?.apiKey || null;
    this.instanceName = config?.instanceName || null;

    if (!this.baseUrl || !this.apiKey || !this.instanceName) {
      logger.warn('[EvolutionProvider] Initialized without credentials. Messages will fail.');
    } else {
      // Ensure no trailing slash
      this.baseUrl = this.baseUrl.replace(/\/$/, '');
      logger.info('[EvolutionProvider] Initialized successfully.');
    }
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<ProviderResponse> {
    if (!this.baseUrl || !this.apiKey || !this.instanceName) {
      return this.createErrorResponse('Missing Evolution API Credentials');
    }

    try {
      const url = `${this.baseUrl}/message/sendText/${this.instanceName}`;

      const data = {
        number: payload.to,
        options: {
          delay: 1200,
          presence: 'composing',
        },
        text: payload.content || '',
      };

      const response = await axios.post(url, data, this.getHeaders());
      return this.createSuccessResponse(response.data?.key?.id);
    } catch (error: any) {
      logger.error(
        '[EvolutionProvider] Error sending text message:',
        error.response?.data || error.message
      );
      return this.createErrorResponse(this.extractErrorMessage(error));
    }
  }

  async sendMedia(payload: WhatsAppMediaPayload): Promise<ProviderResponse> {
    if (!this.baseUrl || !this.apiKey || !this.instanceName) {
      return this.createErrorResponse('Missing Evolution API Credentials');
    }

    try {
      const url = `${this.baseUrl}/message/sendMedia/${this.instanceName}`;

      const data = {
        number: payload.to,
        options: {
          delay: 1200,
          presence: 'composing',
        },
        mediaMessage: {
          mediatype: payload.mimeType?.includes('pdf') ? 'document' : 'image',
          caption: payload.caption || '',
          media: payload.mediaUrl, // URL to the media
          fileName: payload.fileName || 'file',
        },
      };

      const response = await axios.post(url, data, this.getHeaders());
      return this.createSuccessResponse(response.data?.key?.id);
    } catch (error: any) {
      logger.error(
        '[EvolutionProvider] Error sending media message:',
        error.response?.data || error.message
      );
      return this.createErrorResponse(this.extractErrorMessage(error));
    }
  }

  async sendTemplate(payload: WhatsAppTemplatePayload): Promise<ProviderResponse> {
    // Evolution API typically relies on Meta Cloud for official templates if configured,
    // or standard messages if running a normal WhatsApp Web session.
    // Assuming standard implementation if Evolution is linked to an official WABA.
    logger.warn(
      '[EvolutionProvider] Template sending via Evolution API is limited. Ensure WABA configuration.'
    );
    return this.createErrorResponse(
      'Template messaging requires specific Evolution API WABA configuration.'
    );
  }

  async healthCheck(): Promise<boolean> {
    if (!this.baseUrl || !this.apiKey || !this.instanceName) return false;
    try {
      // Check instance connection state
      const url = `${this.baseUrl}/instance/connectionState/${this.instanceName}`;
      const response = await axios.get(url, this.getHeaders());
      return response.data?.instance?.state === 'open';
    } catch (error) {
      logger.error('[EvolutionProvider] Health check failed:', error);
      return false;
    }
  }

  private getHeaders() {
    return {
      headers: {
        apikey: this.apiKey,
        'Content-Type': 'application/json',
      },
    };
  }

  private createSuccessResponse(messageId: string): ProviderResponse {
    return {
      success: true,
      provider: this.name,
      messageId: messageId || `evo-${Date.now()}`,
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

  private extractErrorMessage(error: any): string {
    if (error.response?.data) {
      const data = error.response.data;
      if (data.response?.message?.[0]?.exists === false) {
        return 'Recipient number is not registered on WhatsApp';
      }
      if (data.message) {
        return typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
      }
      if (data.error) {
        return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      }
    }
    return error.message || 'Unknown Evolution API Error';
  }
}
