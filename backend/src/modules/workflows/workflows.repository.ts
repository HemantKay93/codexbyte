import { getAdminClient } from '../../config/supabase.js';

export class WorkflowsRepository {
  async getWorkflows(tenantId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('workflow_definitions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createWorkflow(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('workflow_definitions')
      .insert([
        {
          tenant_id: tenantId,
          name: payload.name,
          description: payload.description,
          trigger_event: payload.trigger_event,
          nodes: payload.nodes || [],
          edges: payload.edges || [],
          is_active: payload.is_active || false,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateWorkflow(tenantId: string, id: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('workflow_definitions')
      .update({
        name: payload.name,
        description: payload.description,
        trigger_event: payload.trigger_event,
        nodes: payload.nodes,
        edges: payload.edges,
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getExecutions(tenantId: string, workflowId?: string) {
    const admin = await getAdminClient();
    let query = admin
      .from('workflow_executions')
      .select('*, workflow_definitions(name)')
      .eq('tenant_id', tenantId)
      .order('started_at', { ascending: false });

    if (workflowId) {
      query = query.eq('workflow_id', workflowId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}
