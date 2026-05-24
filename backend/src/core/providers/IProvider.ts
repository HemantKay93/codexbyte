export interface SendMessagePayload {
  to: string;
  subject?: string;
  content: string;
  metadata?: any;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface IProvider {
  /**
   * Identifies the provider (e.g., 'meta-whatsapp', 'resend-email', 'twilio-sms')
   */
  readonly name: string;

  /**
   * Provider specific initialization (auth, connections)
   */
  initialize(config?: any): Promise<void>;

  /**
   * Unified method for sending a message
   */
  sendMessage(payload: SendMessagePayload): Promise<SendMessageResult>;

  /**
   * Optional method for bulk sending
   */
  sendBulk?(payloads: SendMessagePayload[]): Promise<SendMessageResult[]>;

  /**
   * Optional health check
   */
  isHealthy(): Promise<boolean>;
}
