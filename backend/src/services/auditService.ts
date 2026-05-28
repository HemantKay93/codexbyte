import { getAdminClient } from '../config/supabase.js';

export class AuditService {
  static async log(data: {
    user_id?: string;
    action: string;
    module: string;
    entity_id?: string;
    old_data?: any;
    new_data?: any;
    ip_address?: string;
    user_agent?: string;
  }) {
    try {
      const admin = await getAdminClient();
      const validUserId =
        data.user_id === '00000000-0000-0000-0000-000000000000' ? null : data.user_id;
      await admin.from('audit_logs').insert({ ...data, user_id: validUserId });
    } catch (error) {
      console.error('Audit Log Error:', error);
      // Don't throw, we don't want audit logging to break the main transaction
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
    params: {
      page?: number;
      limit?: number;
      module?: string;
      action?: string;
      userId?: string;
    } = {}
  ) {
    const { page = 1, limit = 100, module, action, userId } = params;
    const admin = await getAdminClient();
    let query = admin
      .from('audit_logs')
      .select('*, user_profiles(full_name)')
      .order('created_at', { ascending: false });

    if (module) query = query.eq('module', module);
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
