import {
  IWhatsAppProvider,
  ProviderResponse,
  WhatsAppMessagePayload,
} from './IWhatsAppProvider.js';
import { MetaCloudProvider } from './metaCloudProvider.js';
import { EvolutionProvider } from './evolutionProvider.js';
import { getAdminClient } from '../../../../config/supabase.js';
import logger from '../../../../services/logger.js';

export class WhatsAppProviderFactory {
  private providers: Map<string, IWhatsAppProvider> = new Map();
  private defaultProviderName: 'meta' | 'evolution' = 'meta';

  constructor() {
    this.providers.set('meta', new MetaCloudProvider());
    this.providers.set('evolution', new EvolutionProvider());
  }

  /**
   * Initializes all enabled providers from the DB config.
   */
  async initializeProviders(): Promise<void> {
    try {
      const admin = await getAdminClient();
      const { data: configs, error } = await admin
        .from('provider_configs')
        .select('*')
        .eq('is_enabled', true)
        .order('priority', { ascending: true });

      if (error) {
        logger.error('[WhatsAppProviderFactory] Failed to fetch provider configs:', error);
        return;
      }

      if (configs && configs.length > 0) {
        // The highest priority enabled provider becomes default
        this.defaultProviderName = configs[0].provider_name as any;

        for (const config of configs) {
          const provider = this.providers.get(config.provider_name);
          if (provider) {
            await provider.initialize(config.config);
          }
        }
      }
    } catch (err) {
      logger.error('[WhatsAppProviderFactory] Init error:', err);
    }
  }

  /**
   * Resolves the primary provider based on override or default.
   */
  getProvider(providerNameOverride?: string): IWhatsAppProvider {
    if (providerNameOverride && this.providers.has(providerNameOverride)) {
      return this.providers.get(providerNameOverride)!;
    }
    return this.providers.get(this.defaultProviderName)!;
  }

  /**
   * Orchestrates sending a message with automatic failover.
   * If the primary provider fails, it attempts the next available enabled provider.
   */
  async sendWithFailover(
    payload: WhatsAppMessagePayload,
    type: 'text' | 'media' | 'template' = 'text',
    providerOverride?: string
  ): Promise<ProviderResponse> {
    const admin = await getAdminClient();

    // Determine sequence
    const primaryName = providerOverride || this.defaultProviderName;
    const primaryProvider = this.providers.get(primaryName)!;

    const response = await this.executeSend(primaryProvider, payload, type);

    if (response.success) {
      return response;
    }

    // --- FAILOVER LOGIC ---
    logger.warn(
      `[WhatsAppProviderFactory] Primary provider (${primaryName}) failed. Attempting failover.`
    );

    await this.logProviderEvent(
      primaryName,
      'failover',
      `Primary provider failed: ${response.error}`
    );

    // Fetch fallback providers (enabled, excluding the primary)
    const { data: fallbacks } = await admin
      .from('provider_configs')
      .select('provider_name')
      .eq('is_enabled', true)
      .neq('provider_name', primaryName)
      .order('priority', { ascending: true });

    if (!fallbacks || fallbacks.length === 0) {
      logger.error('[WhatsAppProviderFactory] No fallback providers available.');
      return response; // Return original failure
    }

    for (const fallback of fallbacks) {
      const fallbackProvider = this.providers.get(fallback.provider_name);
      if (!fallbackProvider) continue;

      logger.info(`[WhatsAppProviderFactory] Trying fallback provider: ${fallback.provider_name}`);

      const fallbackResponse = await this.executeSend(fallbackProvider, payload, type);

      if (fallbackResponse.success) {
        logger.info(`[WhatsAppProviderFactory] Failover to ${fallback.provider_name} succeeded.`);
        return fallbackResponse;
      } else {
        await this.logProviderEvent(
          fallback.provider_name,
          'failover_failed',
          fallbackResponse.error
        );
      }
    }

    return response; // All failed, return primary failure
  }

  private async executeSend(
    provider: IWhatsAppProvider,
    payload: WhatsAppMessagePayload,
    type: 'text' | 'media' | 'template'
  ): Promise<ProviderResponse> {
    switch (type) {
      case 'media':
        return provider.sendMedia(payload as any);
      case 'template':
        return provider.sendTemplate(payload as any);
      default:
        return provider.sendMessage(payload);
    }
  }

  private async logProviderEvent(providerName: string, eventType: string, message?: string) {
    try {
      const admin = await getAdminClient();
      await admin.from('provider_logs').insert({
        provider_name: providerName,
        event_type: eventType,
        message: message || '',
      });
    } catch (e) {
      logger.error('[WhatsAppProviderFactory] Failed to log provider event', e);
    }
  }
}
