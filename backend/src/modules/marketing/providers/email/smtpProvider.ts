import nodemailer from 'nodemailer';
import { IProvider, SendPayload, ProviderResponse } from '../IProvider.js';
import logger from '../../../../services/logger.js';

export class SmtpProvider implements IProvider {
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string = 'noreply@byteevolvr.com';

  async initialize(config: any): Promise<void> {
    if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPass) {
      throw new Error('SMTP Configuration is incomplete. Host, Port, User, and Pass are required.');
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort),
      secure: config.smtpSecure === true || config.smtpSecure === 'true', // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    if (config.defaultFromAddress) {
      this.fromAddress = config.defaultFromAddress;
    }

    // Verify connection configuration
    try {
      await this.transporter.verify();
      logger.info('[SmtpProvider] Initialized and verified successfully');
    } catch (error) {
      logger.error('[SmtpProvider] Verification failed:', error);
      throw error;
    }
  }

  async send(payload: SendPayload): Promise<ProviderResponse> {
    if (!this.transporter) throw new Error('SmtpProvider not initialized');

    try {
      const toList = Array.isArray(payload.to) ? payload.to.join(',') : payload.to;
      
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: toList,
        subject: payload.subject || 'Notification from ByteEvolvr',
        html: payload.body,
      });

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      logger.error('[SmtpProvider] Send error:', err);
      return { success: false, error: err.message };
    }
  }

  async sendBulk(payloads: SendPayload[]): Promise<ProviderResponse[]> {
    if (!this.transporter) throw new Error('SmtpProvider not initialized');

    try {
      // SMTP doesn't have a bulk API, send sequentially
      const promises = payloads.map((p) => this.send(p));
      return await Promise.all(promises);
    } catch (err: any) {
      logger.error('[SmtpProvider] Unexpected bulk error:', err);
      return payloads.map(() => ({ success: false, error: err.message }));
    }
  }
}
