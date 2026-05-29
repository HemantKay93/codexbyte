import { WhatsAppMessagePayload } from '../whatsapp.types.js';

export interface IWhatsAppProvider {
  /**
   * Initializes the provider (e.g. loads session, connects to API)
   */
  initialize(config?: any): Promise<void>;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * Sends a message based on the payload (Text, Media, Template)
   */
  sendMessage(
    to: string,
    payload: WhatsAppMessagePayload
    // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<{ messageId?: string; success: boolean; error?: any }>;
  // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * Returns current connection status
 // eslint-disable-line @typescript-eslint/no-explicit-any
   */
  getStatus(): Promise<{ status: string; details?: any }>;
  // eslint-disable-line @typescript-eslint/no-explicit-any
}
