import { getAdminClient } from '../../config/supabase.js';

export class CrmRepository {
  // --- Leads ---
  async getLeads(tenantId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_leads')
      .select('*, assigned:user_profiles(first_name, last_name, email)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createLead(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_leads')
      .insert([
        {
          tenant_id: tenantId,
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          phone: payload.phone,
          company: payload.company,
          status: payload.status || 'lead',
          score: payload.score || 0,
          assigned_to: payload.assigned_to,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateLeadStatus(tenantId: string, leadId: string, status: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Opportunities ---
  async getOpportunities(tenantId: string, leadId?: string) {
    const admin = await getAdminClient();
    let query = admin
      .from('crm_opportunities')
      .select('*, lead:crm_leads(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createOpportunity(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_opportunities')
      .insert([
        {
          tenant_id: tenantId,
          lead_id: payload.lead_id,
          name: payload.name,
          expected_value: payload.expected_value || 0,
          probability_percentage: payload.probability_percentage || 0,
          expected_close_date: payload.expected_close_date,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Activities ---
  async getActivitiesForLead(tenantId: string, leadId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_activities')
      .select('*, performed:user_profiles(first_name, last_name, email)')
      .eq('tenant_id', tenantId)
      .eq('lead_id', leadId)
      .order('performed_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createActivity(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_activities')
      .insert([
        {
          tenant_id: tenantId,
          lead_id: payload.lead_id,
          type: payload.type,
          notes: payload.notes,
          performed_by: payload.performed_by,
          performed_at: payload.performed_at || new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
