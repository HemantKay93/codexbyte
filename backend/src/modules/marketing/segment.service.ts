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
  async createSegment(payload: any) {
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
    
    // Simple mock logic for MVP. 
    // Real implementation would build dynamic SQL queries based on filter rules
    // For example: if rule is "has ordered > 0", query orders table.
    // We will just return total users if rule is 'all', else 0.
    
    if (filterRules?.type === 'all') {
      const { count } = await admin.from('users').select('*', { count: 'exact', head: true });
      return count || 0;
    }

    // Default 0 for unknown rules until fully implemented query builder
    return 0;
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

    // Example logic:
    if (segment.filter_rules?.type === 'all') {
      // Just fetch all active users
      // NOTE: In production, paginate or use a stream for huge datasets
      const { data: users } = await admin
        .from('users')
        .select('id, email, phone, metadata');
      return users || [];
    }

    return [];
  }
}
