import { supabase, getAdminClient } from '../config/supabase.js';

export class ReviewRepository {
  async findByProductId(productId: string) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, user_profiles(full_name)')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async findAll() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('product_reviews')
      .select(`
        *,
        product:product_id (name),
        user:user_id (full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async create(reviewData: any) {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateStatus(id: string, status: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('product_reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
