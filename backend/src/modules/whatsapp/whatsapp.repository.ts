import { getAdminClient } from '../../config/supabase.js';
import logger from '../../services/logger.js';
import { WhatsAppMessageRecord, WhatsAppSession } from './whatsapp.types.js';

export class WhatsAppRepository {
  async getSession(sessionName: string = 'default'): Promise<WhatsAppSession | null> {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('whatsapp_sessions')
      .select('*')
      .eq('session_name', sessionName)
      .maybeSingle();

    if (error) {
      logger.error('[WhatsAppRepository] Error getting session:', error);
      return null;
    }
    return data;
  }

  async updateSessionState(sessionName: string, state: Partial<WhatsAppSession>) {
    const admin = await getAdminClient();
    const { data: existing, error: selectErr } = await admin
      .from('whatsapp_sessions')
      .select('id')
      .eq('session_name', sessionName)
      .maybeSingle();

    if (selectErr) {
        logger.error('[WhatsAppRepository] Error checking existing session:', selectErr);
    }

    if (existing) {
      const { error: updateErr } = await admin
        .from('whatsapp_sessions')
        .update({
          ...state,
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (updateErr) logger.error('[WhatsAppRepository] Error updating session:', updateErr);
    } else {
      const { error: insertErr } = await admin
        .from('whatsapp_sessions')
        .insert({
          session_name: sessionName,
          ...state,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        });
      if (insertErr) logger.error('[WhatsAppRepository] Error inserting session:', insertErr);
    }
  }

  async createMessageRecord(record: Partial<WhatsAppMessageRecord>): Promise<WhatsAppMessageRecord> {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('whatsapp_messages')
      .insert({
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMessageStatus(id: string, status: 'sent' | 'failed' | 'delivered', errorLog?: string) {
    const admin = await getAdminClient();
    const { error } = await admin
      .from('whatsapp_messages')
      .update({
        status,
        error_log: errorLog || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error(`[WhatsAppRepository] Failed to update message ${id} status:`, error);
    }
  }

  async updateMessageStatusByExternalId(externalId: string, status: 'sent' | 'failed' | 'delivered', errorLog?: string) {
    const admin = await getAdminClient();
    const { error } = await admin
      .from('whatsapp_messages')
      .update({
        status,
        error_log: errorLog || null,
        updated_at: new Date().toISOString(),
      })
      .eq('external_id', externalId);

    if (error) {
      logger.error(`[WhatsAppRepository] Failed to update message by external ID ${externalId} status:`, error);
    }
  }

  async logEvent(level: 'info' | 'error' | 'warn', message: string, meta?: any) {
    const admin = await getAdminClient();
    await admin.from('whatsapp_logs').insert({
      level,
      message,
      meta,
      created_at: new Date().toISOString(),
    });
  }

  async getRecentMessages(page: number = 1, limit: number = 50) {
    const admin = await getAdminClient();
    const offset = (page - 1) * limit;

    const { data, count, error } = await admin
      .from('whatsapp_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count: count || 0, page, limit };
  }

  async getSystemStatus() {
    const admin = await getAdminClient();
    const { data: session } = await admin.from('whatsapp_sessions').select('*').eq('session_name', 'default').maybeSingle();
    const { count: failedCount } = await admin.from('whatsapp_messages').select('*', { count: 'exact', head: true }).eq('status', 'failed');
    
    return {
      session: session || null,
      failedCount: failedCount || 0,
    };
  }

  async updateSessionLastActive() {
    const admin = await getAdminClient();
    await admin.from('whatsapp_sessions').update({ last_active: new Date().toISOString() }).eq('session_name', 'default');
  }

  // --- Templates Management ---

  async getTemplates() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('whatsapp_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getTemplateById(id: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('whatsapp_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createTemplate(template: { name: string, content: string, variables: any[], is_active?: boolean }) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('whatsapp_templates')
      .insert({ ...template, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTemplate(id: string, updates: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('whatsapp_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTemplate(id: string) {
    const admin = await getAdminClient();
    const { error } = await admin
      .from('whatsapp_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
