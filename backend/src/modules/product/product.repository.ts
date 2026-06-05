import { getAdminClient } from '../../config/supabase.js';

export class ProductRepository {
  async findAll(filters: any = {}) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const page = Number(filters.page) || 1;
    const pageSize = Math.min(Number(filters.pageSize) || 50, 200);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = admin.from('products').select('*', { count: 'exact' }).is('deleted_at', null);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data, total: count ?? 0, page, pageSize };
  }

  async findById(id: string) {
    const admin = await getAdminClient();
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    const column = isUuid ? 'id' : 'slug';
    const { data, error } = await admin
      .from('products')
      .select('*')
      .eq(column, id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(productData: any, userId?: string) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const validUserId = userId === '00000000-0000-0000-0000-000000000000' ? null : userId;
    const { data, error } = await admin
      .from('products')
      .insert([
        {
          ...productData,
          created_by: validUserId,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, productData: any, userId?: string) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const validUserId = userId === '00000000-0000-0000-0000-000000000000' ? null : userId;
    const { data, error } = await admin
      .from('products')
      .update({
        ...productData,
        updated_by: validUserId,
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
    const validUserId = userId === '00000000-0000-0000-0000-000000000000' ? null : userId;
    const { error } = await admin
      .from('products')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: validUserId,
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async restore(id: string, userId?: string) {
    const admin = await getAdminClient();
    const validUserId = userId === '00000000-0000-0000-0000-000000000000' ? null : userId;
    const { error } = await admin
      .from('products')
      .update({
        deleted_at: null,
        updated_by: validUserId,
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async bulkCreate(products: any[], userId?: string) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const validUserId = userId === '00000000-0000-0000-0000-000000000000' ? null : userId;
    const productsWithAudit = products.map((p) => ({
      ...p,
      created_by: validUserId,
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
