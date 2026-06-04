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
          deal_id: payload.deal_id,
          customer_id: payload.customer_id,
          activity_type: payload.type || 'note',
          title: payload.title || 'Activity',
          notes: payload.notes,
          assigned_to: payload.assigned_to,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Pipelines & Kanban ---
  async getPipelines(tenantId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_pipelines')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Auto-initialize if empty
    if (!data || data.length === 0) {
      const { data: newPipe, error: pipeErr } = await admin
        .from('crm_pipelines')
        .insert({
          tenant_id: tenantId,
          name: 'Standard Sales Pipeline',
          is_default: true,
        })
        .select()
        .single();

      if (pipeErr) throw pipeErr;

      await admin.from('crm_stages').insert([
        { tenant_id: tenantId, pipeline_id: newPipe.id, name: 'Lead', sequence: 1 },
        { tenant_id: tenantId, pipeline_id: newPipe.id, name: 'Contact Made', sequence: 2 },
        { tenant_id: tenantId, pipeline_id: newPipe.id, name: 'Proposal', sequence: 3 },
        { tenant_id: tenantId, pipeline_id: newPipe.id, name: 'Negotiation', sequence: 4 },
        { tenant_id: tenantId, pipeline_id: newPipe.id, name: 'Won', sequence: 5 },
        { tenant_id: tenantId, pipeline_id: newPipe.id, name: 'Lost', sequence: 6 },
      ]);

      return [newPipe];
    }

    return data;
  }

  async getBoardData(tenantId: string, pipelineId: string) {
    const admin = await getAdminClient();
    const { data: stages, error: stagesErr } = await admin
      .from('crm_stages')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('pipeline_id', pipelineId)
      .order('sequence', { ascending: true });

    if (stagesErr) throw stagesErr;

    const { data: deals, error: dealsErr } = await admin
      .from('crm_deals')
      .select('*, customer:customers(first_name, last_name, email), assigned:user_profiles(email)')
      .eq('tenant_id', tenantId)
      .eq('pipeline_id', pipelineId);

    if (dealsErr) throw dealsErr;

    return stages.map((stage: any) => ({
      ...stage,
      deals: deals
        .filter((d: any) => d.stage_id === stage.id)
        .map((d: any) => ({
          ...d,
          customer_email: d.customer?.email,
          assigned_user_email: d.assigned?.email,
        })),
    }));
  }

  async createDeal(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_deals')
      .insert([
        {
          tenant_id: tenantId,
          title: payload.title,
          value: payload.value || 0,
          pipeline_id: payload.pipeline_id,
          stage_id: payload.stage_id,
          customer_id: payload.customer_id,
          assigned_to: payload.assigned_to,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async moveDealStage(tenantId: string, dealId: string, stageId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_deals')
      .update({ stage_id: stageId, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
