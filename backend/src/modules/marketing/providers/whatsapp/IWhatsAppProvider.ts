export interface ProviderResponse {
  success: boolean;
  provider: 'meta' | 'evolution' | 'unknown';
  messageId?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'queued';
  error?: string;
  metadata?: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface WhatsAppMessagePayload {
  to: string;
  content?: string;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  metadata?: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-line @typescript-eslint/no-explicit-any
  languageCode?: string;
  components?: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface IWhatsAppProvider {
  /**
   * Identifies the provider (e.g., 'meta', 'evolution')
   */
  readonly name: 'meta' | 'evolution';

  /**
 // eslint-disable-line @typescript-eslint/no-explicit-any
   * Provider specific initialization (auth, connections)
   */
  initialize(config?: any): Promise<void>;
  // eslint-disable-line @typescript-eslint/no-explicit-any

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
