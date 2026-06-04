import { getAdminClient } from '../../config/supabase.js';

export class ApprovalsRepository {
  // --- Templates ---
  async getTemplates(tenantId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('approval_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createTemplate(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('approval_templates')
      .insert([{ tenant_id: tenantId, ...payload }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Requests ---
  async getRequests(tenantId: string, userId?: string) {
    const admin = await getAdminClient();
    const query = admin
      .from('approval_requests')
      .select('*, approval_templates(name, module, entity_type), users!requester_id(email)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (userId) {
      // In a real scenario, we might want to fetch requests where this user is the *approver*
      // or the *requester*. For simplicity, we'll just fetch all or filter later.
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getPendingRequestsForApprover(tenantId: string, approverId: string) {
    const admin = await getAdminClient();
    // Complex query: get requests that have a pending step for this approver
    const { data, error } = await admin
      .from('approval_steps')
      .select('*, approval_requests(*, approval_templates(name, module))')
      .eq('tenant_id', tenantId)
      .eq('approver_user_id', approverId)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  }

  async createRequest(tenantId: string, payload: any, steps: any[]) {
    const admin = await getAdminClient();

    const { data: request, error: reqError } = await admin
      .from('approval_requests')
      .insert([
        {
          tenant_id: tenantId,
          template_id: payload.template_id,
          entity_id: payload.entity_id,
          requester_id: payload.requester_id,
          payload: payload.payload,
        },
      ])
      .select()
      .single();

    if (reqError) throw reqError;

    // Create Steps
    const stepsToInsert = steps.map((s) => ({
      tenant_id: tenantId,
      request_id: request.id,
      approver_role: s.approver_role,
      approver_user_id: s.approver_user_id,
      step_order: s.step_order,
    }));

    const { error: stepError } = await admin.from('approval_steps').insert(stepsToInsert);

    if (stepError) throw stepError;

    return request;
  }

  async actOnStep(tenantId: string, stepId: string, status: string, comments?: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('approval_steps')
      .update({ status, comments, acted_at: new Date().toISOString() })
      .eq('id', stepId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateRequestStatus(tenantId: string, requestId: string, status: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('approval_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
