import { WhatsAppMessagePayload } from '../whatsapp.types.js';

export interface IWhatsAppProvider {
  /**
   * Initializes the provider (e.g. loads session, connects to API)
   */
  initialize(config?: any): Promise<void>;

  /**
   * Sends a message based on the payload (Text, Media, Template)
   */
  sendMessage(
    to: string,
    payload: WhatsAppMessagePayload
  ): Promise<{ messageId?: string; success: boolean; error?: any }>;

  /**
   * Returns current connection status
   */
  getStatus(): Promise<{ status: string; details?: any }>;
}
