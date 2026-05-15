import { supabase, getAdminClient } from '../config/supabase.js';

export class ProductRepository {
  async findAll(filters: any = {}) {
    const admin = await getAdminClient();
    let query = admin.from('products').select('*').is('deleted_at', null);

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
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  }

  async create(productData: any, userId?: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('products')
      .insert([
        {
          ...productData,
          created_by: userId,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, productData: any, userId?: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('products')
      .update({
        ...productData,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string, userId?: string) {
    const admin = await getAdminClient();
    const { error } = await admin
      .from('products')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async restore(id: string, userId?: string) {
    const admin = await getAdminClient();
    const { error } = await admin
      .from('products')
      .update({
        deleted_at: null,
        updated_by: userId,
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async bulkCreate(products: any[], userId?: string) {
    const admin = await getAdminClient();
    const productsWithAudit = products.map((p) => ({
      ...p,
      created_by: userId,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await admin
      .from('products')
      .upsert(productsWithAudit, { onConflict: 'sku' })
      .select();

    if (error) throw error;
    return data;
  }
}
