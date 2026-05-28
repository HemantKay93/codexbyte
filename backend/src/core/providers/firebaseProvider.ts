import admin from 'firebase-admin';

import logger from '../../services/logger.js';

import { IProvider, SendMessagePayload, SendMessageResult } from './IProvider.js';

export class FirebaseProvider implements IProvider {
  public readonly name = 'firebase-push';
  private app: admin.app.App | null = null;

  async initialize(): Promise<void> {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
      logger.warn('[FirebaseProvider] Missing FIREBASE_SERVICE_ACCOUNT_BASE64');
    } else {
      try {
        const serviceAccount = JSON.parse(
          Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
        );
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        this.app = admin.app();
        logger.info('[FirebaseProvider] Initialized successfully');
      } catch (err: any) {
        logger.error('[FirebaseProvider] Failed to initialize:', err);
      }
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResult> {
    if (!this.app) {
      return {
        success: false,
        error: 'FirebaseProvider not initialized',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];

      const message = {
        notification: {
          title: payload.subject || 'ByteEvolvr Notification',
          body: payload.content,
        },
        token: tokens[0],
      };

      const messageId = await this.app.messaging().send(message);
      return { success: true, messageId, timestamp: new Date().toISOString() };
    } catch (err: any) {
      logger.error('[FirebaseProvider] Send error:', err);
      return { success: false, error: err.message, timestamp: new Date().toISOString() };
    }
  }

  async sendBulk(payloads: SendMessagePayload[]): Promise<SendMessageResult[]> {
    if (!this.app) {
      return payloads.map(() => ({
        success: false,
        error: 'FirebaseProvider not initialized',
        timestamp: new Date().toISOString(),
      }));
    }

    try {
      const messages = payloads.map((p) => ({
        notification: {
          title: p.subject || 'ByteEvolvr Notification',
          body: p.content,
        },
        token: Array.isArray(p.to) ? p.to[0] : p.to,
      }));

      const response = await this.app.messaging().sendEach(messages);

      return response.responses.map((res) => ({
        success: res.success,
        messageId: res.messageId,
        error: res.error?.message,
        timestamp: new Date().toISOString(),
      }));
    } catch (err: any) {
      logger.error('[FirebaseProvider] Unexpected bulk error:', err);
      return payloads.map(() => ({
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  async isHealthy(): Promise<boolean> {
    return this.app !== null;
  }
}
