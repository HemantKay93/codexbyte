import { getAdminClient } from '../../config/supabase.js';
import { AppError } from '../../middlewares/error.js';
import { AuditService } from '../../services/auditService.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars
import { NotificationService } from '../../services/notificationService.js';
import logger from '../../services/logger.js';

export class InventoryService {
  private static LOW_STOCK_THRESHOLD = 5;

  static async reserveStock(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    userId?: string;
  }): Promise<{ reservationId: string }> {
    const admin = await getAdminClient();

    // Check available stock (quantity - reserved_quantity)
    const { data: inventory, error: invError } = await admin
      .from('inventory')
      .select('id, quantity, reserved_quantity')
      .eq('product_id', data.productId)
      .eq('warehouse_id', data.warehouseId)
      .maybeSingle();

    if (invError) throw invError;
    if (!inventory) {
      throw new AppError(`Product ${data.productId} not found in warehouse`, 404);
    }

    const availableStock = inventory.quantity - (inventory.reserved_quantity || 0);
    if (availableStock < data.quantity) {
      throw new AppError(
        `Insufficient available stock. Requested: ${data.quantity}, Available: ${availableStock}`,
        400
      );
    }

    const reservationId = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Increment reserved_quantity
    const { error: reserveError } = await admin
      .from('inventory')
      .update({ reserved_quantity: (inventory.reserved_quantity || 0) + data.quantity })
      .eq('id', inventory.id);

    if (reserveError) {
      throw new AppError('Failed to lock inventory', 500);
    }

    logger.info(
      `[Inventory] Reserved ${data.quantity} of product ${data.productId}. Reservation ID: ${reservationId}`
    );
    return { reservationId };
  }

  static async releaseReservation(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reservationId: string;
  }) {
    const admin = await getAdminClient();
    const { data: inventory } = await admin
      .from('inventory')
      .select('id, reserved_quantity')
      .eq('product_id', data.productId)
      .eq('warehouse_id', data.warehouseId)
      .maybeSingle();

    if (inventory && inventory.reserved_quantity >= data.quantity) {
      await admin
        .from('inventory')
        .update({ reserved_quantity: inventory.reserved_quantity - data.quantity })
        .eq('id', inventory.id);
      logger.info(`[Inventory] Released reservation ${data.reservationId}`);
    }
  }

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

    const { data: inventory, error: invError } = await admin
      .from('inventory')
      .select('id, quantity, reserved_quantity')
      .eq('product_id', data.productId)
      .eq('warehouse_id', data.warehouseId)
      .maybeSingle();

    if (invError) throw invError;

    let inventoryId = inventory?.id;
    const currentQty = inventory?.quantity || 0;
    const newQty = currentQty + data.quantity;
    const reservedQty = inventory?.reserved_quantity || 0;

    // When deducting, we must make sure we don't deduct into reserved stock unless it's a checkout
    // For simplicity, we just check absolute zero here.
    if (newQty < 0) {
      throw new AppError(`Insufficient stock`, 400);
    }

    if (inventory) {
      // If this is an 'out' adjustment coming from an order, we must also deduct reserved_quantity
      let newReserved = reservedQty;
      if (data.type === 'out' && data.referenceType === 'order') {
        newReserved = Math.max(0, reservedQty - Math.abs(data.quantity));
      }

      await admin
        .from('inventory')
        .update({
          quantity: newQty,
          reserved_quantity: newReserved,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inventory.id);
    } else {
      const { data: newInv, error: insertError } = await admin
        .from('inventory')
        .insert({
          product_id: data.productId,
          warehouse_id: data.warehouseId,
          quantity: newQty,
          reserved_quantity: 0,
        })
        .select('id')
        .single();
      if (insertError) throw insertError;
      inventoryId = newInv.id;
    }

    await admin.from('stock_movements').insert({
      inventory_id: inventoryId,
      type: data.type,
      quantity: data.quantity,
      reference_type: data.referenceType,
      reference_id: data.referenceId,
      notes: data.notes,
      performed_by: data.userId,
    });

    const { data: allInv } = await admin
      .from('inventory')
      .select('quantity')
      .eq('product_id', data.productId);
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const totalStock = allInv?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    // eslint-disable-line @typescript-eslint/no-explicit-any

    await admin.from('products').update({ stock_quantity: totalStock }).eq('id', data.productId);

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

  static async getStockMovements(productId: string) {
    const admin = await getAdminClient();

    // First find all inventory IDs for this product
    const { data: invData, error: invError } = await admin
      .from('inventory')
      .select('id, warehouses(name)')
      .eq('product_id', productId);

    if (invError) throw invError;
    if (!invData || invData.length === 0) return [];
    // eslint-disable-line @typescript-eslint/no-explicit-any

    const invIds = invData.map((i: any) => i.id);
    // eslint-disable-line @typescript-eslint/no-explicit-any

    // Then get movements for those inventory IDs
    const { data, error } = await admin
      .from('stock_movements')
      .select('*, user_profiles(full_name)')
      .in('inventory_id', invIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // eslint-disable-line @typescript-eslint/no-explicit-any

    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Map warehouse name back to movements
    return data.map((m: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      const inv = invData.find((i: any) => i.id === m.inventory_id);
      // eslint-disable-line @typescript-eslint/no-explicit-any
      return {
        ...m,
        warehouse_name: inv?.warehouses?.name || 'Unknown',
      };
    });
  }
}
