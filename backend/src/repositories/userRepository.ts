import { supabase, getAdminClient } from '../config/supabase.js';

export class UserRepository {
  async findAll() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('user_profiles')
      .select('*, addresses(*), orders(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateRole(id: string, role: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async setStatus(id: string, isActive: boolean) {
    const admin = await getAdminClient();
    // Assuming we add is_active to user_profiles
    const { data, error } = await admin
      .from('user_profiles')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
