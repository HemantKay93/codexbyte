import { getAdminClient } from '../config/supabase.js';
import { redis } from '../config/redis.js';

export class RbacService {
  static async hasPermission(
    tenantId: string,
    roleName: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    // 1. Super Admins bypass permission checks
    if (roleName === 'super-admin') return true;

    const cacheKey = `rbac:${tenantId}:${roleName}:${resource}:${action}`;

    // 2. Check Cache
    try {
      if (redis.status === 'ready') {
        const cached = await redis.get(cacheKey);
        if (cached) return cached === '1';
      }
    } catch (e) {
      /* ignore */
    }

    // 3. Database Check
    const admin = await getAdminClient();

    // Get Role ID
    const { data: role } = await admin
      .from('auth_roles')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('name', roleName)
      .single();

    if (!role) return false;

    // Get Permission ID
    const { data: perm } = await admin
      .from('auth_permissions')
      .select('id')
      .eq('resource', resource)
      .eq('action', action)
      .single();

    if (!perm) return false;

    // Check Mapping
    const { data: mapping } = await admin
      .from('auth_role_permissions')
      .select('id')
      .eq('role_id', role.id)
      .eq('permission_id', perm.id)
      .single();

    const hasAccess = !!mapping;

    // 4. Cache Result (1 hour)
    try {
      if (redis.status === 'ready') {
        await redis.set(cacheKey, hasAccess ? '1' : '0', 'EX', 3600);
      }
    } catch (e) {
      /* ignore */
    }

    return hasAccess;
  }
}
