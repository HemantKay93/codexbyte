import * as admin from 'firebase-admin';
import { IProvider, SendPayload, ProviderResponse } from '../IProvider.js';
import logger from '../../../../services/logger.js';

export class FirebaseProvider implements IProvider {
  private isInitialized = false;

  async initialize(config: any): Promise<void> {
    if (!config.fcmServerKey) {
      throw new Error('FCM Server Key is missing');
    }

    if (!admin.apps.length) {
      // In a real scenario you would probably use a service account JSON, 
      // but for legacy FCM or simple token-based setups:
      // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      // For now, we will mock the initialization or expect standard environment variable credentials
      // since the user might just be providing a server key.
      logger.warn('[FirebaseProvider] FCM Server Key provided but standard Firebase Admin SDK initialization requires Service Account JSON. Ensure GOOGLE_APPLICATION_CREDENTIALS is set.');
      
      try {
        admin.initializeApp();
        this.isInitialized = true;
      } catch (err: any) {
        logger.error('[FirebaseProvider] Initialization failed:', err);
      }
    } else {
      this.isInitialized = true;
    }
    
    logger.info('[FirebaseProvider] Initialized successfully');
  }

  async send(payload: SendPayload): Promise<ProviderResponse> {
    if (!this.isInitialized) throw new Error('FirebaseProvider not initialized');

    try {
      const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];
      
      const message = {
        notification: {
          title: payload.subject || 'ByteEvolvr Notification',
          body: payload.body,
        },
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      if (response.failureCount > 0) {
        logger.warn(`[FirebaseProvider] Sent with ${response.failureCount} failures.`);
      }

      // We just return the first message ID as a reference, though multicast returns many
      const firstSuccess = response.responses.find(r => r.success);
      return { 
        success: response.successCount > 0, 
        messageId: firstSuccess?.messageId,
        error: response.failureCount === tokens.length ? 'All push notifications failed' : undefined
      };
    } catch (err: any) {
      logger.error('[FirebaseProvider] Send error:', err);
      return { success: false, error: err.message };
    }
  }

  async sendBulk(payloads: SendPayload[]): Promise<ProviderResponse[]> {
    if (!this.isInitialized) throw new Error('FirebaseProvider not initialized');

    try {
      // Firebase allows sendEach for multiple different messages
      const messages = payloads.map((p) => ({
        notification: {
          title: p.subject || 'ByteEvolvr Notification',
          body: p.body,
        },
        token: Array.isArray(p.to) ? p.to[0] : p.to, // Bulk API requires single token per message object
      }));

      const response = await admin.messaging().sendEach(messages);

      return response.responses.map((res) => ({
        success: res.success,
        messageId: res.messageId,
        error: res.error?.message,
      }));
    } catch (err: any) {
      logger.error('[FirebaseProvider] Unexpected bulk error:', err);
      return payloads.map(() => ({ success: false, error: err.message }));
    }
  }
}
