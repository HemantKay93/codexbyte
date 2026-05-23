import { IProvider } from './IProvider.js';
import { ResendProvider } from './email/resendProvider.js';
import { BrevoProvider } from './email/brevoProvider.js';
import { SmtpProvider } from './email/smtpProvider.js';
import { FirebaseProvider } from './push/firebaseProvider.js';
import { CloudApiProvider } from '../../whatsapp/providers/cloudApiProvider.js';
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
      provider = new BrevoProvider();
    } else if (activeProvider === 'smtp') {
      provider = new SmtpProvider();
    } else {
      provider = new ResendProvider();
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
    
    const provider = new FirebaseProvider();
    await provider.initialize(pushConf);
    return provider;
  }

  /**
   * Get the configured WhatsApp Provider (Cloud API)
   */
  static async getWhatsAppProvider(): Promise<IProvider> {
    const settings = await CMSService.getContent('global');
    const waConfig = settings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
    
    // Using CloudApiProvider we built in the previous phase
    // Note: CloudApiProvider implements our IWhatsAppProvider which has slightly different signature,
    // so we wrap it here or ensure signatures match.
    const provider = new CloudApiProvider() as any; 
    await provider.initialize(waConfig);
    
    // Wrapper to adapt IWhatsAppProvider to IProvider generic signature
    return {
      initialize: async (config) => provider.initialize(config),
      send: async (payload) => {
        const res = await provider.sendMessage(Array.isArray(payload.to) ? payload.to[0] : payload.to, { content: payload.body, type: 'text' });
        return { success: res.success, messageId: res.messageId, error: res.error };
      },
      sendBulk: async (payloads) => {
        const results = [];
        for (const p of payloads) {
            const res = await provider.sendMessage(Array.isArray(p.to) ? p.to[0] : p.to, { content: p.body, type: 'text' });
            results.push({ success: res.success, messageId: res.messageId, error: res.error });
        }
        return results;
      }
    };
  }
}
