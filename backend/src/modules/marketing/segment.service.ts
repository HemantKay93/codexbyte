import { getAdminClient } from '../../config/supabase.js';
import { AppError } from '../../middlewares/error.js';

export class SegmentService {
  /**
   * Get all defined audience segments
   */
  async getSegments() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('audience_segments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create a new audience segment
   */
  async createSegment(payload: Record<string, any>) {
    const admin = await getAdminClient();

    // Estimate count before saving
    const count = await this.estimateAudienceCount(payload.filter_rules);

    const { data, error } = await admin
      .from('audience_segments')
      .insert({
        ...payload,
        estimated_count: count,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Run the filter rules against the users/orders tables to count matching users
   */
  async estimateAudienceCount(filterRules: any): Promise<number> {
    const admin = await getAdminClient();

    if (filterRules?.type === 'all') {
      const { count } = await admin.from('users').select('*', { count: 'exact', head: true });
      return count || 0;
    }

    let query = admin.from('users').select('*', { count: 'exact', head: true });
    query = this.applyRulesToQuery(query, filterRules);

    const { count, error } = await query;
    if (error) {
      console.error('[SegmentService] Error estimating count:', error);
      return 0;
    }
    return count || 0;
  }

  /**
   * Translates JSON rules into Supabase PostgREST query builders
   */
  private applyRulesToQuery(query: any, filterRules: any) {
    if (!filterRules || !filterRules.rules || !Array.isArray(filterRules.rules)) {
      return query;
    }

    // Example rule format: { field: 'email', operator: 'like', value: '%@gmail.com' }
    for (const rule of filterRules.rules) {
      const { field, operator, value } = rule;
      switch (operator) {
        case 'eq':
          query = query.eq(field, value);
          break;
        case 'neq':
          query = query.neq(field, value);
          break;
        case 'gt':
          query = query.gt(field, value);
          break;
        case 'gte':
          query = query.gte(field, value);
          break;
        case 'lt':
          query = query.lt(field, value);
          break;
        case 'lte':
          query = query.lte(field, value);
          break;
        case 'like':
          query = query.ilike(field, value); // Using case-insensitive like
          break;
        case 'in':
          query = query.in(field, Array.isArray(value) ? value : [value]);
          break;
        default:
          break;
      }
    }
    return query;
  }

  /**
   * Fetch actual user emails/phones based on a segment ID
   */
  async resolveSegmentUsers(segmentId: string): Promise<any[]> {
    const admin = await getAdminClient();

    const { data: segment, error: segError } = await admin
      .from('audience_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (segError || !segment) {
      throw new AppError('Segment not found', 404);
    }

    if (segment.filter_rules?.type === 'all') {
      const { data: users } = await admin.from('users').select('id, email, phone, metadata');
      return users || [];
    }

    let query = admin.from('users').select('id, email, phone, metadata');
    query = this.applyRulesToQuery(query, segment.filter_rules);

    const { data: users, error: queryError } = await query;
    if (queryError) {
      throw new AppError(`Failed to resolve segment users: ${queryError.message}`, 500);
    }

    return users || [];
  }
}
