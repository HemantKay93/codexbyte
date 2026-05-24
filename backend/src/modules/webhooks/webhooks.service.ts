import { getAdminClient } from '../../config/supabase.js';
import logger from '../../services/logger.js';

export class WebhooksService {
  /**
   * Universal Webhook Handler
   */
  async handleEvent(payload: Record<string, any>, provider: string): Promise<void> {
    logger.info(`[WebhooksService] Received webhook from ${provider}:`, payload);

    switch (provider) {
      case 'resend':
        await this.handleResendEvent(payload);
        break;
      case 'brevo':
        await this.handleBrevoEvent(payload);
        break;
      case 'meta-whatsapp':
        await this.handleMetaWhatsAppEvent(payload);
        break;
      default:
        logger.warn(`[WebhooksService] Unknown provider: ${provider}`);
    }
  }

  private async handleResendEvent(payload: Record<string, any>) {
    const { type, data } = payload;
    const recipientId = data?.tags?.find((t: any) => t.name === 'recipientId')?.value;
    const campaignId = data?.tags?.find((t: any) => t.name === 'campaignId')?.value;

    if (!recipientId || !campaignId) return;

    let status = '';
    switch (type) {
      case 'email.sent':
        status = 'sent';
        break;
      case 'email.delivered':
        status = 'delivered';
        break;
      case 'email.bounced':
        status = 'bounced';
        break;
      case 'email.opened':
        status = 'opened';
        break;
      case 'email.clicked':
        status = 'clicked';
        break;
      case 'email.complained':
        status = 'spam_reported';
        break;
      default:
        return;
    }

    await this.updateRecipientStatus(recipientId, campaignId, status);
  }

  private async handleBrevoEvent(payload: Record<string, any>) {
    const { event, tags } = payload;
    const recipientId = tags?.find((t: string) => t.startsWith('recipientId:'))?.split(':')[1];
    const campaignId = tags?.find((t: string) => t.startsWith('campaignId:'))?.split(':')[1];

    if (!recipientId || !campaignId) return;

    let status = '';
    switch (event) {
      case 'sent':
        status = 'sent';
        break;
      case 'delivered':
        status = 'delivered';
        break;
      case 'hard_bounce':
      case 'soft_bounce':
        status = 'bounced';
        break;
      case 'opened':
        status = 'opened';
        break;
      case 'click':
        status = 'clicked';
        break;
      case 'spam':
        status = 'spam_reported';
        break;
      default:
        return;
    }

    await this.updateRecipientStatus(recipientId, campaignId, status);
  }

  private async handleMetaWhatsAppEvent(payload: Record<string, any>) {
    // Meta sends a nested structure: entry[0].changes[0].value.statuses[0]
    const entries = payload.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const statuses = change.value?.statuses || [];
        for (const stat of statuses) {
          const wamid = stat.id;
          let status = '';
          switch (stat.status) {
            case 'sent':
              status = 'sent';
              break;
            case 'delivered':
              status = 'delivered';
              break;
            case 'read':
              status = 'opened';
              break;
            case 'failed':
              status = 'failed';
              break;
          }

          if (status && wamid) {
            // Find the recipient by wamid (external_message_id)
            const supabase = await getAdminClient();
            const { data } = await supabase
              .from('campaign_recipients')
              .select('id, campaign_id')
              .eq('external_message_id', wamid)
              .single();

            if (data) {
              await this.updateRecipientStatus(data.id, data.campaign_id, status);
            }
          }
        }
      }
    }
  }

  /**
   * Updates the campaign_recipients status and calls the DB function to update the aggregate analytics.
   */
  private async updateRecipientStatus(recipientId: string, campaignId: string, status: string) {
    const supabase = await getAdminClient();
    try {
      // 1. Update the recipient row
      const { error: updateErr } = await supabase
        .from('campaign_recipients')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipientId);

      if (updateErr) throw updateErr;

      // 2. Call Postgres function to recalculate aggregates securely and concurrently
      // (This prevents race conditions when updating the JSONB field in campaign_analytics)
      const { error: fnErr } = await supabase.rpc('update_campaign_analytics', {
        p_campaign_id: campaignId,
        p_status: status,
      });

      if (fnErr) throw fnErr;

      logger.info(`[WebhooksService] Successfully updated recipient ${recipientId} to ${status}`);
    } catch (error) {
      logger.error(
        `[WebhooksService] Failed to update status for recipient ${recipientId}:`,
        error
      );
    }
  }
}
