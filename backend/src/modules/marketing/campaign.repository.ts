import { getAdminClient } from '../../config/supabase.js';
import { CampaignState } from '../../core/fsm/CampaignStateMachine.js';
import logger from '../../services/logger.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars

export class CampaignRepository {
  /**
   * Get paginated campaigns
   */
  async getCampaigns(page: number = 1, limit: number = 20) {
    const admin = await getAdminClient();
    const offset = (page - 1) * limit;

    const { data, count, error } = await admin
      .from('campaigns')
      .select('*, audience_segments(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count: count || 0, page, limit };
  }

  /**
   * Create a new campaign
   */
  // eslint-disable-line @typescript-eslint/no-explicit-any
  async createCampaign(campaign: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('campaigns')
      .insert({
        ...campaign,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Insert bulk recipients for a campaign
 // eslint-disable-line @typescript-eslint/no-explicit-any
   */
  async insertRecipients(recipients: any[]) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (recipients.length === 0) return;
    const admin = await getAdminClient();
    const { error } = await admin.from('campaign_recipients').insert(recipients);
    if (error) throw error;
  }

  /**
 // eslint-disable-line @typescript-eslint/no-explicit-any
   * Update campaign status
   */
  async updateCampaignStatus(id: string, status: CampaignState, additionalData: any = {}) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { error } = await admin
      .from('campaigns')
      .update({ status, ...additionalData, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Update recipient status
 // eslint-disable-line @typescript-eslint/no-explicit-any
   */
  async updateRecipientStatus(id: string, status: string, errorLog?: string, externalId?: string) {
    const admin = await getAdminClient();
    const updates: any = { status, updated_at: new Date().toISOString() };
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (errorLog !== undefined) updates.error_log = errorLog;
    if (externalId !== undefined) updates.external_id = externalId;

    const { error } = await admin.from('campaign_recipients').update(updates).eq('id', id);

    if (error) throw error;
  }

  /**
   * Get recipients for a campaign (used by worker)
   */
  async getRecipients(campaignId: string, status: string = 'queued', limit: number = 100) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('campaign_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', status)
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
