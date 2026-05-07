import { getAdminClient } from '../config/supabase.js';
import logger from '../services/logger.js';

export const logAudit = async (
  userId: string | undefined,
  action: string,
  module: string,
  entityId?: string,
  oldData?: any,
  newData?: any,
  req?: any
) => {
  try {
    const admin = await getAdminClient();
    await admin.from('audit_logs').insert({
      user_id: userId,
      action,
      module,
      entity_id: entityId,
      old_data: oldData,
      new_data: newData,
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent']
    });
  } catch (error) {
    logger.error('Failed to save audit log:', error);
  }
};
