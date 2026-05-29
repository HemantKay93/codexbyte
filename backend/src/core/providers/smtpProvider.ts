import nodemailer from 'nodemailer';

import logger from '../../services/logger.js';

import { IProvider, SendMessagePayload, SendMessageResult } from './IProvider.js';

export class SmtpProvider implements IProvider {
  public readonly name = 'smtp-email';
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string = 'noreply@byteevolvr.com';

  async initialize(config?: any): Promise<void> {
    const smtpHost = config?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = config?.smtpPort || process.env.SMTP_PORT;
    const smtpUser = config?.smtpUser || process.env.SMTP_USER;
    const smtpPass = config?.smtpPass || process.env.SMTP_PASS;
    const secure = config?.smtpSecure !== undefined ? config.smtpSecure : (Number(smtpPort) === 465);
    
    if (config?.defaultFromAddress) {
      this.fromAddress = config.defaultFromAddress;
    }

    if (!smtpHost || !smtpPort) {
      logger.warn('[SmtpProvider] Missing SMTP configurations');
    } else {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      logger.info('[SmtpProvider] Initialized successfully');
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'SmtpProvider not initialized',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const toList = Array.isArray(payload.to) ? payload.to.join(',') : payload.to;

      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: toList,
        subject: payload.subject || 'Notification from ByteEvolvr',
        html: payload.content,
      });

      return { success: true, messageId: info.messageId, timestamp: new Date().toISOString() };
    } catch (err: any) {
      logger.error('[SmtpProvider] Send error:', err);
      return { success: false, error: err.message, timestamp: new Date().toISOString() };
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.transporter) return false;
    try {
      return await this.transporter.verify();
    } catch (e) {
      logger.warn('[SmtpProvider] Health check failed:', e);
      return false;
    }
  }
}
