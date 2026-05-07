import { getAdminClient } from '../config/supabase.js';
import logger from '../services/logger.js';

export class OrderRepository {
  async findAll(filters: any = {}) {
    const admin = await getAdminClient();
    let query = admin
      .from('orders')
      .select('*, order_items(*), shipments(*), user_profiles(full_name, email)');

    if (filters.status) {
      query = query.eq('status', filters.status.toLowerCase());
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('orders')
      .select('*, order_items(*), shipments(*), user_profiles(*), addresses(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    return this.findById(id);
  }

  async findByUserId(userId: string, email?: string) {
    const admin = await getAdminClient();
    logger.info(`[Repository] Fetching orders for UserID: ${userId}, Email: ${email}`);

    const query = admin
      .from('orders')
      .select('*, order_items(*)')
      .or(`user_id.eq.${userId}${email ? `,customer_email.eq.${email}` : ''}`)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      logger.error('[Repository] Error fetching orders:', error);
      throw error;
    }

    logger.info(`[Repository] Found ${data?.length || 0} orders`);
    return data;
  }

  async create(orderData: any, items: any[]) {
    const admin = await getAdminClient();

    // 1. Create the order
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await admin.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return { ...order, order_items: orderItems };
  }

  async update(id: string, updateData: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateShipment(orderId: string, courier: string, trackingId: string) {
    const admin = await getAdminClient();

    const { data: existing } = await admin
      .from('shipments')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await admin
        .from('shipments')
        .update({
          courier_name: courier,
          tracking_id: trackingId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await admin
        .from('shipments')
        .insert({
          order_id: orderId,
          courier_name: courier || '',
          tracking_id: trackingId || '',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }
}
