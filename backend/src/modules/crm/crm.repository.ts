import { getAdminClient } from '../../config/supabase.js';

export class CrmRepository {
  // --- Pipelines ---
  async getPipelines(tenantId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_pipelines')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createPipeline(tenantId: string, name: string, isDefault: boolean = false) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_pipelines')
      .insert([{ tenant_id: tenantId, name, is_default: isDefault }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Stages ---
  async getStages(tenantId: string, pipelineId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_stages')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('pipeline_id', pipelineId)
      .order('sequence', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createStage(tenantId: string, pipelineId: string, name: string, sequence: number, probability: number) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_stages')
      .insert([{ tenant_id: tenantId, pipeline_id: pipelineId, name, sequence, probability }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Deals ---
  async getDeals(tenantId: string, pipelineId?: string) {
    const admin = await getAdminClient();
    let query = admin
      .from('crm_deals')
      .select('*, customers(first_name, last_name, email), crm_stages(name), user_profiles(email)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (pipelineId) {
      query = query.eq('pipeline_id', pipelineId);
    }
    const { data, error } = await query;
    if (error) throw error;
    
    // Flatten joins for frontend
    return (data || []).map((d: any) => ({
      ...d,
      customer_email: d.customers?.email,
      first_name: d.customers?.first_name,
      last_name: d.customers?.last_name,
      stage_name: d.crm_stages?.name,
      assigned_user_email: d.user_profiles?.email
    }));
  }

  async createDeal(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_deals')
      .insert([{
        tenant_id: tenantId,
        customer_id: payload.customer_id,
        title: payload.title,
        value: payload.value || 0,
        pipeline_id: payload.pipeline_id,
        stage_id: payload.stage_id,
        expected_close_date: payload.expected_close_date,
        assigned_to: payload.assigned_to
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateDealStage(tenantId: string, dealId: string, stageId: string) {
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

  // --- Activities ---
  async getActivitiesForDeal(tenantId: string, dealId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_activities')
      .select('*, user_profiles(email)')
      .eq('tenant_id', tenantId)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map((a: any) => ({
      ...a,
      assigned_user_email: a.user_profiles?.email
    }));
  }

  async createActivity(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('crm_activities')
      .insert([{
        tenant_id: tenantId,
        deal_id: payload.deal_id,
        customer_id: payload.customer_id,
        activity_type: payload.activity_type,
        title: payload.title,
        notes: payload.notes,
        due_date: payload.due_date,
        assigned_to: payload.assigned_to
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
