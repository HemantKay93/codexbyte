import { IProvider } from '../../../core/providers/IProvider.js';
import { ResendEmailProvider } from '../../../core/providers/ResendEmailProvider.js';
import { BrevoProvider } from '../../../core/providers/brevoProvider.js';
import { SmtpProvider } from '../../../core/providers/smtpProvider.js';
import { FirebaseProvider } from '../../../core/providers/firebaseProvider.js';
import { MetaWhatsAppProvider } from '../../../core/providers/MetaWhatsAppProvider.js';
import { CMSService } from '../../cms/cms.service.js';

export class ProviderService {
  /**
   * Get the configured Email Provider
   */
  static async getEmailProvider(): Promise<IProvider> {
    const settings = await CMSService.getContent('global');
    const emailConf = settings?.find((s: any) => s.section_key === 'email_config')?.content || {};

    const activeProvider = emailConf.activeProvider || 'resend';

    let provider: IProvider;
    if (activeProvider === 'brevo') {
      provider = new BrevoProvider() as any;
    } else if (activeProvider === 'smtp') {
      provider = new SmtpProvider() as any;
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
    const settings = await CMSService.getContent('global');
    const pushConf = settings?.find((s: any) => s.section_key === 'push_config')?.content || {};

    const provider = new FirebaseProvider() as any;
    await provider.initialize(pushConf);
    return provider;
  }

  /**
   * Get the configured WhatsApp Provider (Cloud API)
   */
  static async getWhatsAppProvider(): Promise<IProvider> {
    const settings = await CMSService.getContent('global');
    const waConfig = settings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};

    const provider = new MetaWhatsAppProvider();
    await provider.initialize(waConfig);

    return {
      name: 'whatsapp-wrapper',
      initialize: async (config?: any) => provider.initialize(config),
      isHealthy: async () => provider.isHealthy(),
      sendMessage: async (payload: any) => {
        const res = await provider.sendMessage({
          to: Array.isArray(payload.to) ? payload.to[0] : payload.to,
          content: payload.content || payload.body || '',
          metadata: { type: 'text' },
        });
        return {
          success: res.success,
          messageId: res.messageId,
          error: res.error,
          timestamp: res.timestamp,
        };
      },
      sendBulk: async (payloads: any[]) => {
        const results = [];
        for (const p of payloads) {
          const res = await provider.sendMessage({
            to: Array.isArray(p.to) ? p.to[0] : p.to,
            content: p.content || p.body || '',
            metadata: { type: 'text' },
          });
          results.push({
            success: res.success,
            messageId: res.messageId,
            error: res.error,
            timestamp: res.timestamp,
          });
        }
        return results;
      },
    };
  }
}
