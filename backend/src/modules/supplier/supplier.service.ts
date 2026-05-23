import { getAdminClient } from '../../config/supabase.js';
import { AppError } from '../../middlewares/error.js';
import { InventoryService } from '../inventory/inventory.service.js';
import logger from '../../services/logger.js';

export class SupplierService {
  async getSuppliers() {
    const admin = await getAdminClient();
    const { data, error } = await admin.from('suppliers').select('*').order('created_at', { ascending: false });
    if (error) throw new AppError('Failed to fetch suppliers', 500);
    return data;
  }

  async createSupplier(data: any) {
    const admin = await getAdminClient();
    const { data: supplier, error } = await admin
      .from('suppliers')
      .insert({
        name: data.name,
        contact_name: data.contact,
        email: data.email,
        status: data.status || 'active',
      })
      .select()
      .single();
      
    if (error) throw new AppError('Failed to create supplier', 500);
    return supplier;
  }

  // --- Purchase Orders ---

  async getPurchaseOrders(supplierId?: string) {
    const admin = await getAdminClient();
    let query = admin.from('purchase_orders').select('*, suppliers(name), purchase_order_items(*)').order('created_at', { ascending: false });
    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }
    const { data, error } = await query;
    if (error) throw new AppError('Failed to fetch POs', 500);
    return data;
  }

  async createPurchaseOrder(data: { supplierId: string, expectedDelivery?: string, items: { productId: string, quantity: number, unitCost: number }[] }, userId: string) {
    const admin = await getAdminClient();
    
    // 1. Calculate total
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    // 2. Create PO
    const { data: po, error: poError } = await admin.from('purchase_orders').insert({
      supplier_id: data.supplierId,
      status: 'pending',
      total_amount: totalAmount,
      expected_delivery: data.expectedDelivery,
      created_by: userId
    }).select().single();

    if (poError || !po) throw new AppError('Failed to create PO', 500);

    // 3. Create PO Items
    const itemsToInsert = data.items.map(item => ({
      purchase_order_id: po.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_cost: item.unitCost
    }));

    const { error: itemsError } = await admin.from('purchase_order_items').insert(itemsToInsert);
    if (itemsError) throw new AppError('Failed to create PO items', 500);

    return po;
  }

  async receivePurchaseOrder(poId: string, warehouseId: string, userId: string) {
    const admin = await getAdminClient();
    
    // 1. Fetch PO and items
    const { data: po, error: poError } = await admin
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('id', poId)
      .single();

    if (poError || !po) throw new AppError('PO not found', 404);
    if (po.status === 'received') throw new AppError('PO is already received', 400);

    // 2. Update PO status
    const { error: updateError } = await admin.from('purchase_orders').update({ status: 'received', received_at: new Date().toISOString() }).eq('id', poId);
    if (updateError) throw new AppError('Failed to update PO status', 500);

    // 3. Sync with Inventory Service automatically!
    for (const item of po.purchase_order_items) {
      await InventoryService.adjustStock({
        productId: item.product_id,
        warehouseId: warehouseId, // Which warehouse the goods arrived at
        quantity: item.quantity,
        type: 'in',
        referenceType: 'purchase_order',
        referenceId: po.id,
        notes: `Received from PO ${po.id}`,
        userId: userId
      });
    }

    logger.info(`[Supplier] PO ${poId} marked as received and inventory synced to warehouse ${warehouseId}`);
    return { success: true, message: 'PO received and inventory updated successfully' };
  }
}
