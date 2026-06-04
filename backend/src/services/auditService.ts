import { getAdminClient } from '../config/supabase.js';

export class AuditService {
  static async log(data: {
    tenant_id?: string;
    user_id?: string;
    action: string;
    resource?: string;
    module?: string;
    resource_id?: string;
    entity_id?: string;
    metadata?: any;
    new_data?: any;
    old_data?: any;
    ip_address?: string;
    user_agent?: string;
  }) {
    try {
      const resource = data.resource || data.module || 'system';
      const resource_id = data.resource_id || data.entity_id;
      const metadata =
        data.metadata ||
        data.new_data ||
        (data.old_data ? { old: data.old_data, new: data.new_data } : undefined);
      const validUserId =
        data.user_id === '00000000-0000-0000-0000-000000000000' ? null : data.user_id;
      const admin = await getAdminClient();
      await admin.from('system_audit_logs').insert({
        tenant_id: data.tenant_id,
        user_id: validUserId,
        action: data.action,
        resource,
        resource_id,
        metadata,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      });
    } catch (error) {
      console.error('Audit Log Error:', error);
    }
  }

  static async logOrderActivity(data: {
    order_id: string;
    status: string;
    notes?: string;
    performed_by?: string;
  }) {
    try {
      const admin = await getAdminClient();
      const validUserId =
        data.performed_by === '00000000-0000-0000-0000-000000000000' ? null : data.performed_by;
      await admin.from('order_activity_logs').insert({ ...data, performed_by: validUserId });
    } catch (error) {
      console.error('Order Activity Log Error:', error);
    }
  }

  static async getLogs(
    tenantId: string,
    params: {
      page?: number;
      limit?: number;
      resource?: string;
      action?: string;
      userId?: string;
    } = {}
  ) {
    const { page = 1, limit = 100, resource, action, userId } = params;
    const admin = await getAdminClient();
    let query = admin
      .from('system_audit_logs')
      .select('*, user:user_profiles(full_name, email)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (resource) query = query.eq('resource', resource);
    if (action) query = query.eq('action', action);
    if (userId) query = query.eq('user_id', userId);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
