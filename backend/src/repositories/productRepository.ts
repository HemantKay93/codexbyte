import { supabase, getAdminClient } from '../config/supabase.js';

export class ProductRepository {
  async findAll(filters: any = {}) {
    const admin = await getAdminClient();
    let query = admin.from('products').select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(productData: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, productData: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const admin = await getAdminClient();
    const { error } = await admin
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
  async bulkCreate(products: any[]) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('products')
      .insert(products)
      .select();
    
    if (error) throw error;
    return data;
  }
}
