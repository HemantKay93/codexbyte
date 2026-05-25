import axios from 'axios';
import {
  IWhatsAppProvider,
  ProviderResponse,
  WhatsAppMessagePayload,
  WhatsAppMediaPayload,
  WhatsAppTemplatePayload,
} from './IWhatsAppProvider.js';
import logger from '../../../../services/logger.js';

/**
 * OpenWA Fallback Provider
 * Serves as a temporary fallback while migrating fully to Meta/Evolution.
 * Assumes a local or remote REST wrapper around OpenWA.
 */
export class OpenWAProvider implements IWhatsAppProvider {
  public readonly name = 'openwa';
  private baseUrl: string | null = null;
  private apiKey: string | null = null;

  async initialize(config?: any): Promise<void> {
    this.baseUrl = config?.baseUrl || 'http://localhost:8080'; // Default legacy wrapper endpoint
    this.apiKey = config?.apiKey || null;

    logger.info(
      '[OpenWAProvider] Initialized successfully. (DEPRECATION WARNING: Use Meta/Evolution)'
    );
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<ProviderResponse> {
    if (!this.baseUrl) return this.createErrorResponse('Missing OpenWA Base URL');

    try {
      // Example endpoint for a typical OpenWA HTTP wrapper
      const url = `${this.baseUrl}/api/sendText`;
      const data = {
        chatId: `${payload.to}@c.us`,
        text: payload.content || '',
      };

      const response = await axios.post(url, data, this.getHeaders());
      return this.createSuccessResponse(response.data?.messageId);
    } catch (error: any) {
      logger.error('[OpenWAProvider] Error sending text message:', error.message);
      return this.createErrorResponse(error.message);
    }
  }

  async sendMedia(payload: WhatsAppMediaPayload): Promise<ProviderResponse> {
    if (!this.baseUrl) return this.createErrorResponse('Missing OpenWA Base URL');

    try {
      const url = `${this.baseUrl}/api/sendFileFromUrl`;
      const data = {
        chatId: `${payload.to}@c.us`,
        url: payload.mediaUrl,
        caption: payload.caption || '',
        filename: payload.fileName || 'file',
      };

      const response = await axios.post(url, data, this.getHeaders());
      return this.createSuccessResponse(response.data?.messageId);
    } catch (error: any) {
      logger.error('[OpenWAProvider] Error sending media message:', error.message);
      return this.createErrorResponse(error.message);
    }
  }

  async sendTemplate(payload: WhatsAppTemplatePayload): Promise<ProviderResponse> {
    return this.createErrorResponse('Templates are not supported by OpenWA Fallback');
  }

  async healthCheck(): Promise<boolean> {
    if (!this.baseUrl) return false;
    try {
      const response = await axios.get(`${this.baseUrl}/api/session/status`, this.getHeaders());
      return response.data?.status === 'CONNECTED';
    } catch (error) {
      return false;
    }
  }

  private getHeaders() {
    return {
      headers: {
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        'Content-Type': 'application/json',
      },
    };
  }

  private createSuccessResponse(messageId: string): ProviderResponse {
    return {
      success: true,
      provider: this.name,
      messageId: messageId || `owa-${Date.now()}`,
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
