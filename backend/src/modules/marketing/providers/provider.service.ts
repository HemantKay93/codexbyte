import { IProvider, SendMessagePayload } from '../../../core/providers/IProvider.js';
import { ResendEmailProvider } from '../../../core/providers/ResendEmailProvider.js';
import { BrevoProvider } from '../../../core/providers/brevoProvider.js';
import { SmtpProvider } from '../../../core/providers/smtpProvider.js';
import { FirebaseProvider } from '../../../core/providers/firebaseProvider.js';
import { QueueJobPayload } from '../../../core/contracts/index.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars
import { CMSService } from '../../cms/cms.service.js';

import { MetaCloudProvider } from './whatsapp/metaCloudProvider.js';
import { ProviderHealthService } from './provider-health.service.js';

export class ProviderService {
  /**
   * Get the configured Email Provider
   */
  static async getEmailProvider(): Promise<IProvider> {
    if (await ProviderHealthService.isTripped('email')) {
      throw new Error('Email provider is currently unavailable (Circuit Tripped)');
    }
    const settings = await CMSService.getContent('global');
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const emailConf = settings?.find((s: any) => s.section_key === 'email_config')?.content || {};
    // eslint-disable-line @typescript-eslint/no-explicit-any

    const activeProvider = emailConf.activeProvider || 'resend';

    let provider: IProvider;
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (activeProvider === 'brevo') {
      provider = new BrevoProvider() as any;
      // eslint-disable-line @typescript-eslint/no-explicit-any
      // eslint-disable-line @typescript-eslint/no-explicit-any
    } else if (activeProvider === 'smtp') {
      provider = new SmtpProvider() as any;
      // eslint-disable-line @typescript-eslint/no-explicit-any
    } else {
      provider = new ResendEmailProvider();
    }

    await provider.initialize(emailConf);
    return provider;
  }

  /**
   * Get the configured Push Notification Provider
   */
  static async getPushProvider(): Promise<IProvider> {
    if (await ProviderHealthService.isTripped('push')) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      throw new Error('Push provider is currently unavailable (Circuit Tripped)');
    }
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const settings = await CMSService.getContent('global');
    const pushConf = settings?.find((s: any) => s.section_key === 'push_config')?.content || {};
    // eslint-disable-line @typescript-eslint/no-explicit-any

    const provider = new FirebaseProvider() as any;
    // eslint-disable-line @typescript-eslint/no-explicit-any
    await provider.initialize(pushConf);
    return provider;
  }

  /**
   * Get the configured WhatsApp Provider (Cloud API)
   */
  // eslint-disable-line @typescript-eslint/no-explicit-any
  static async getWhatsAppProvider(): Promise<IProvider> {
    if (await ProviderHealthService.isTripped('whatsapp')) {
      throw new Error('WhatsApp provider is currently unavailable (Circuit Tripped)');
    }
    const settings = await CMSService.getContent('global');
    const waConfig = settings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
    // eslint-disable-line @typescript-eslint/no-explicit-any

    const provider = new MetaCloudProvider();
    await provider.initialize(waConfig);

    return {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      name: 'whatsapp-wrapper',
      initialize: async (config?: any) => provider.initialize(config),
      // eslint-disable-line @typescript-eslint/no-explicit-any
      isHealthy: async () => provider.healthCheck(),
      sendMessage: async (payload: SendMessagePayload) => {
        const res = await provider.sendMessage({
          to: Array.isArray(payload.to) ? payload.to[0] : payload.to,
          content: payload.content || (payload as any).body || '',
          // eslint-disable-line @typescript-eslint/no-explicit-any
          metadata: { type: 'text' },
        });
        return {
          success: res.success,
          messageId: res.messageId,
          error: res.error,
          // eslint-disable-line @typescript-eslint/no-explicit-any
          timestamp: new Date().toISOString(),
        };
      },
      sendBulk: async (payloads: SendMessagePayload[]) => {
        const results = [];
        for (const p of payloads) {
          const res = await provider.sendMessage({
            to: Array.isArray(p.to) ? p.to[0] : p.to,
            content: p.content || (p as any).body || '',
            // eslint-disable-line @typescript-eslint/no-explicit-any
            metadata: { type: 'text' },
          });
          results.push({
            success: res.success,
            messageId: res.messageId,
            error: res.error,
            timestamp: new Date().toISOString(),
          });
        }
        return results;
      },
    };
  }
}
