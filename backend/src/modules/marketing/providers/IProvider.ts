export interface SendPayload {
  to: string | string[];
  subject?: string;
  body: string;
  variables?: Record<string, string>;
}

export interface ProviderResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IProvider {
  /**
   * Initialize the provider with settings (API keys, etc.)
   */
  initialize(config: any): Promise<void>;

  /**
   * Send a single message
   */
  send(payload: SendPayload): Promise<ProviderResponse>;

  /**
   * Send messages in bulk
   */
  sendBulk(payloads: SendPayload[]): Promise<ProviderResponse[]>;
}
