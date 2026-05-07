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
      await admin.from('audit_logs').insert(data);
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
      await admin.from('order_activity_logs').insert(data);
    } catch (error) {
      console.error('Order Activity Log Error:', error);
    }
  }
}
