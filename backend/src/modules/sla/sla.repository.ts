import { getAdminClient } from '../../config/supabase.js';

export class SlaRepository {
  async getPolicies(tenantId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('sla_policies')
      .select('*, sla_targets(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createPolicy(tenantId: string, payload: any, targets: any[]) {
    const admin = await getAdminClient();
    
    // Create Policy
    const { data: policy, error: policyError } = await admin
      .from('sla_policies')
      .insert([{
        tenant_id: tenantId,
        name: payload.name,
        description: payload.description,
        module: payload.module,
        entity_type: payload.entity_type,
        conditions: payload.conditions,
        is_active: payload.is_active !== undefined ? payload.is_active : true
      }])
      .select()
      .single();
    if (policyError) throw policyError;

    // Create Targets
    if (targets && targets.length > 0) {
      const targetsToInsert = targets.map(t => ({
        tenant_id: tenantId,
        policy_id: policy.id,
        metric: t.metric,
        target_value_minutes: t.target_value_minutes,
        warning_threshold_minutes: t.warning_threshold_minutes,
        business_hours_only: t.business_hours_only || false
      }));

      const { error: targetsError } = await admin
        .from('sla_targets')
        .insert(targetsToInsert);
      
      if (targetsError) throw targetsError;
    }

    return policy;
  }

  async getBreaches(tenantId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('sla_breaches')
      .select('*, sla_policies(name, module), sla_targets(metric, target_value_minutes)')
      .eq('tenant_id', tenantId)
      .order('breached_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async acknowledgeBreach(tenantId: string, breachId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('sla_breaches')
      .update({ status: 'acknowledged' })
      .eq('id', breachId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
