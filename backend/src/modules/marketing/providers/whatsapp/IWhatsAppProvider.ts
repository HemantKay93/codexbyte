export interface ProviderResponse {
  success: boolean;
  provider: 'meta' | 'evolution' | 'openwa' | 'unknown';
  messageId?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'queued';
  error?: string;
  metadata?: any;
}

export interface WhatsAppMessagePayload {
  to: string;
  content?: string;
  metadata?: any;
  campaignId?: string;
}

export interface WhatsAppMediaPayload extends WhatsAppMessagePayload {
  mediaUrl: string;
  caption?: string;
  mimeType?: string;
  fileName?: string;
}

export interface WhatsAppTemplatePayload extends WhatsAppMessagePayload {
  templateId: string;
  languageCode?: string;
  components?: any[];
}

export interface IWhatsAppProvider {
  /**
   * Identifies the provider (e.g., 'meta', 'evolution', 'openwa')
   */
  readonly name: 'meta' | 'evolution' | 'openwa';

  /**
   * Provider specific initialization (auth, connections)
   */
  initialize(config?: any): Promise<void>;

  /**
   * Send a standard text message
   */
  sendMessage(payload: WhatsAppMessagePayload): Promise<ProviderResponse>;

  /**
   * Send a media message (image, video, document)
   */
  sendMedia(payload: WhatsAppMediaPayload): Promise<ProviderResponse>;

  /**
   * Send an approved template message
   */
  sendTemplate(payload: WhatsAppTemplatePayload): Promise<ProviderResponse>;

  /**
   * Send bulk messages
   */
  sendBulk?(payloads: WhatsAppMessagePayload[]): Promise<ProviderResponse[]>;

  /**
   * Get delivery status of a previously sent message
   */
  getStatus?(messageId: string): Promise<ProviderResponse>;

  /**
   * Check if the provider is healthy and ready to send
   */
  healthCheck(): Promise<boolean>;
}
