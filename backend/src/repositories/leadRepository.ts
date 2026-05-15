import { getAdminClient } from '../config/supabase.js';

export class LeadRepository {
  async create(leadData: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('leads')
      .insert([
        {
          ...leadData,
          status: leadData.status || 'new',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
