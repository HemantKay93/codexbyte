import { getAdminClient } from '../config/supabase.js';
import { InventoryService } from './inventoryService.js';
import { AuditService } from './auditService.js';
import { AppError } from '../middlewares/error.js';
import logger from './logger.js';

export class ReturnService {
  /**
   * Create a new return request (RMA)
   */
  async createReturnRequest(data: {
    orderId: string;
    userId: string;
    reason: string;
    items: { orderItemId: string; quantity: number; reason?: string }[];
  }) {
    const admin = await getAdminClient();
    const rmaNumber = `RMA-${Date.now()}`;

    // 1. Create the Return Record
    const { data: returnRecord, error: returnError } = await admin
      .from('order_returns')
      .insert({
        order_id: data.orderId,
        user_id: data.userId,
        rma_number: rmaNumber,
        reason: data.reason,
        status: 'pending',
      })
      .select()
      .single();

    if (returnError) throw returnError;

    // 2. Create Return Items
    const returnItems = data.items.map((item) => ({
      return_id: returnRecord.id,
      order_item_id: item.orderItemId,
      quantity: item.quantity,
      reason: item.reason,
    }));

    const { error: itemsError } = await admin.from('order_return_items').insert(returnItems);
    if (itemsError) throw itemsError;

    // 3. Log Activity
    await AuditService.logOrderActivity({
      order_id: data.orderId,
      status: 'pending',
      notes: `Return request created: ${rmaNumber}. Reason: ${data.reason}`,
      performed_by: data.userId,
    });

    return returnRecord;
  }

  /**
   * Approve or Reject a return request
   */
  async updateReturnStatus(
    returnId: string,
    status: 'approved' | 'rejected' | 'received' | 'refunded',
    notes?: string,
    adminId?: string
  ) {
    const admin = await getAdminClient();

    const { data: returnRecord, error: fetchError } = await admin
      .from('order_returns')
      .select('*, order_return_items(*)')
      .eq('id', returnId)
      .single();

    if (fetchError || !returnRecord) throw new AppError('Return request not found', 404);

    const { error: updateError } = await admin
      .from('order_returns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', returnId);

    if (updateError) throw updateError;

    // Logic for 'received' - Restock Inventory
    if (status === 'received') {
      const { data: order } = await admin
        .from('orders')
        .select('warehouse_id')
        .eq('id', returnRecord.order_id)
        .single();
      const warehouseId = order?.warehouse_id;

      for (const item of returnRecord.order_return_items) {
        // Fetch product_id from order_item
        const { data: orderItem } = await admin
          .from('order_items')
          .select('product_id')
          .eq('id', item.order_item_id)
          .single();

        if (orderItem) {
          await InventoryService.adjustStock({
            productId: orderItem.product_id,
            warehouseId: warehouseId, // Restock to original warehouse or central hub
            quantity: item.quantity,
            type: 'return',
            referenceType: 'order',
            referenceId: returnRecord.order_id,
            notes: `Inventory restocked from RMA ${returnRecord.rma_number}`,
            userId: adminId,
          });
        }
      }
    }

    // Logic for 'refunded' - Update order payment status
    if (status === 'refunded') {
      await admin
        .from('orders')
        .update({ payment_status: 'refunded', status: 'returned' })
        .eq('id', returnRecord.order_id);
    }

    // Log Activity
    await AuditService.logOrderActivity({
      order_id: returnRecord.order_id,
      status: status === 'refunded' ? 'returned' : 'pending',
      notes: `Return ${returnRecord.rma_number} status updated to ${status}. ${notes || ''}`,
      performed_by: adminId,
    });

    await AuditService.log({
      user_id: adminId,
      action: 'RMA_STATUS_UPDATE',
      module: 'returns',
      entity_id: returnId,
      new_data: { status, notes },
    });

    return { success: true };
  }

  async getAllReturns(filters: any = {}) {
    const admin = await getAdminClient();
    let query = admin
      .from('order_returns')
      .select('*, user_profiles(full_name), orders(order_number)')
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
