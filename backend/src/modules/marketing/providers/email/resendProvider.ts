import { Resend } from 'resend';
import { IProvider, SendPayload, ProviderResponse } from '../IProvider.js';
import logger from '../../../../services/logger.js';

export class ResendProvider implements IProvider {
  private resend: Resend | null = null;
  private fromAddress: string = 'noreply@byteevolvr.com';

  async initialize(config: any): Promise<void> {
    if (!config.resendApiKey) {
      throw new Error('Resend API Key is missing');
    }
    this.resend = new Resend(config.resendApiKey);
    if (config.defaultFromAddress) {
      this.fromAddress = config.defaultFromAddress;
    }
    logger.info('[ResendProvider] Initialized successfully');
  }

  async send(payload: SendPayload): Promise<ProviderResponse> {
    if (!this.resend) throw new Error('ResendProvider not initialized');

    try {
      const to = Array.isArray(payload.to) ? payload.to : [payload.to];
      
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: to,
        subject: payload.subject || 'Notification from ByteEvolvr',
        html: payload.body,
      });

      if (error) {
        logger.error('[ResendProvider] Send error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (err: any) {
      logger.error('[ResendProvider] Unexpected error:', err);
      return { success: false, error: err.message };
    }
  }

  async sendBulk(payloads: SendPayload[]): Promise<ProviderResponse[]> {
    if (!this.resend) throw new Error('ResendProvider not initialized');

    try {
      const batchData = payloads.map(p => ({
        from: this.fromAddress,
        to: Array.isArray(p.to) ? p.to : [p.to],
        subject: p.subject || 'Notification from ByteEvolvr',
        html: p.body,
      }));

      // Resend bulk API
      const { data, error } = await this.resend.batch.send(batchData);

      if (error) {
        logger.error('[ResendProvider] Bulk send error:', error);
        // Map error to all items
        return payloads.map(() => ({ success: false, error: error.message }));
      }

      // Map successful message IDs
      return (data?.data || []).map((res: any) => ({
        success: true,
        messageId: res.id
      }));
    } catch (err: any) {
      logger.error('[ResendProvider] Unexpected bulk error:', err);
      return payloads.map(() => ({ success: false, error: err.message }));
    }
  }
}
