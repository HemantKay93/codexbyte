import { getAdminClient } from '../../config/supabase.js';
import { AppError } from '../../middlewares/error.js';
import { AuditService } from '../../services/auditService.js';
import { NotificationService } from '../../services/notificationService.js';
import logger from '../../services/logger.js';

export class InventoryService {
  private static LOW_STOCK_THRESHOLD = 5;

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
      throw new AppError(
        `Insufficient stock in warehouse for product ${data.productId} (Current: ${currentQty}, Requested: ${Math.abs(data.quantity)})`,
        400
      );
    }

    logger.info(
      `[Inventory] Adjusting stock for product ${data.productId} in warehouse ${data.warehouseId}. Delta: ${data.quantity}, New Qty: ${newQty}`
    );

    if (inventory) {
      // Update existing
      const { error: updateError } = await admin
        .from('inventory')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', inventory.id);
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

    const totalStock = allInv?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    logger.info(`[Inventory] Calculated total stock for product ${data.productId}: ${totalStock}`);

    const { error: prodUpdateError } = await admin
      .from('products')
      .update({ stock_quantity: totalStock })
      .eq('id', data.productId);

    if (prodUpdateError) {
      logger.error('[Inventory] Failed to update master product stock:', prodUpdateError);
    }

    // 4. Check for Low Stock Notification
    if (newQty <= InventoryService.LOW_STOCK_THRESHOLD) {
      try {
        const { data: prod } = await admin
          .from('products')
          .select('name')
          .eq('id', data.productId)
          .single();
        const { data: wh } = await admin
          .from('warehouses')
          .select('name')
          .eq('id', data.warehouseId)
          .single();
        if (prod && wh) {
          await NotificationService.notifyLowStock(prod.name, wh.name, newQty);
        }
      } catch (e) {
        logger.error('Failed to send low stock notification:', e);
      }
    }

    return { success: true, newQuantity: newQty, totalQuantity: totalStock };
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

  static async transferStock(data: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    notes?: string;
    userId?: string;
  }) {
    logger.info(
      `[Inventory] Transferring ${data.quantity} of product ${data.productId} from ${data.fromWarehouseId} to ${data.toWarehouseId}`
    );

    // 1. Remove from source
    await this.adjustStock({
      productId: data.productId,
      warehouseId: data.fromWarehouseId,
      quantity: -Math.abs(data.quantity),
      type: 'transfer',
      notes: data.notes || `Transfer to warehouse ${data.toWarehouseId}`,
      userId: data.userId,
    });

    try {
      // 2. Add to destination
      return await this.adjustStock({
        productId: data.productId,
        warehouseId: data.toWarehouseId,
        quantity: Math.abs(data.quantity),
        type: 'transfer',
        notes: data.notes || `Transfer from warehouse ${data.fromWarehouseId}`,
        userId: data.userId,
      });
    } catch (error) {
      // Rollback: Add back to source
      logger.error(
        `[Inventory] Transfer failed, rolling back deduction from ${data.fromWarehouseId}`,
        error
      );
      await this.adjustStock({
        productId: data.productId,
        warehouseId: data.fromWarehouseId,
        quantity: Math.abs(data.quantity),
        type: 'adjustment',
        notes: `Rollback: Transfer to warehouse ${data.toWarehouseId} failed`,
        userId: data.userId,
      });
      throw error;
    }
  }
}
