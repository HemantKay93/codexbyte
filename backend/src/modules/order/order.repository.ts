import { getAdminClient } from '../../config/supabase.js';
import logger from '../../services/logger.js';

export class OrderRepository {
  async findAll(filters: any = {}) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    let query = admin
      .from('orders')
      .select('*, order_items(*), shipments(*), user_profiles(full_name, email)')
      .is('deleted_at', null);

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
      .is('deleted_at', null)
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
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      logger.error('[Repository] Error fetching orders:', error);
      throw error;
    }

    logger.info(`[Repository] Found ${data?.length || 0} orders`);
    return data;
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  async createCheckoutOrder(payload: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { data: order, error } = await admin.rpc('create_checkout_order', payload);

    if (error) {
      logger.error('[OrderRepository] RPC Error:', error);
      throw error;
    }
    return order;
  }

  async updateOrderAmounts(
    orderId: string,
    payload: { discount_amount: number; shipping_amount: number }
  ) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    await admin.from('orders').update(payload).eq('id', orderId);
  }

  async create(orderData: any, items: any[], userId?: string) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();

    const validUserId = userId === '00000000-0000-0000-0000-000000000000' ? null : userId;

    // 1. Create the order
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        ...orderData,
        created_by: validUserId,
        updated_at: new Date().toISOString(),
      })
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
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (itemsError) throw itemsError;

    return { ...order, order_items: orderItems };
    // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  async update(id: string, updateData: any, userId?: string) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const validUserId = userId === '00000000-0000-0000-0000-000000000000' ? null : userId;
    const payload: Record<string, any> = {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      ...updateData,
      updated_at: new Date().toISOString(),
    };
    if (validUserId) {
      payload.updated_by = validUserId;
    }

    const { data, error } = await admin
      .from('orders')
      .update(payload)
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
      .from('orders')
      .update({
        deleted_at: new Date().toISOString(),
        ...(validUserId && { updated_by: validUserId }),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
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
