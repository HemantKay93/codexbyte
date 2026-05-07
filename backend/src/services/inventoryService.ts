import { getAdminClient } from '../config/supabase.js';
import { AppError } from '../middlewares/error.js';
import { AuditService } from './auditService.js';

export class InventoryService {
  static async adjustStock(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: 'in' | 'out' | 'transfer' | 'adjustment' | 'return';
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    userId?: string;
  }) {
    const admin = await getAdminClient();

    // 1. Get or Create Inventory record
    const { data: inventory, error: invError } = await admin
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', data.productId)
      .eq('warehouse_id', data.warehouseId)
      .maybeSingle();

    if (invError) throw invError;

    let inventoryId = inventory?.id;
    const currentQty = inventory?.quantity || 0;
    const newQty = currentQty + data.quantity;

    if (newQty < 0) {
      throw new AppError(`Insufficient stock in warehouse for product ${data.productId}`, 400);
    }

    if (inventory) {
      // Update existing
      const { error: updateError } = await admin
        .from('inventory')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', inventoryId);
      if (updateError) throw updateError;
    } else {
      // Create new
      const { data: newInv, error: insertError } = await admin
        .from('inventory')
        .insert({
          product_id: data.productId,
          warehouse_id: data.warehouseId,
          quantity: newQty,
        })
        .select('id')
        .single();
      if (insertError) throw insertError;
      inventoryId = newInv.id;
    }

    // 2. Record Stock Movement
    const { error: moveError } = await admin.from('stock_movements').insert({
      inventory_id: inventoryId,
      type: data.type,
      quantity: data.quantity,
      reference_type: data.referenceType,
      reference_id: data.referenceId,
      notes: data.notes,
      performed_by: data.userId,
    });

    if (moveError) throw moveError;

    // 3. Update main products table total stock (for legacy compatibility/easy querying)
    const { data: allInv } = await admin
      .from('inventory')
      .select('quantity')
      .eq('product_id', data.productId);

    const totalStock = allInv?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    await admin.from('products').update({ stock_quantity: totalStock }).eq('id', data.productId);

    return { success: true, newQuantity: newQty };
  }

  static async getWarehouseStock(warehouseId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('inventory')
      .select('*, products(name, sku, price)')
      .eq('warehouse_id', warehouseId);

    if (error) throw error;
    return data;
  }

  static async getProductStock(productId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('inventory')
      .select('*, warehouses(name, location)')
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  }
}
