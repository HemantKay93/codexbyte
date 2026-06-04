import { supabase, getAdminClient } from '../../config/supabase.js';

export class InventoryRepository {
  static async getInventoryByProduct(tenantId: string, productId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('inventory_stock')
      .select(
        '*, bin:inventory_bins(*, shelf:inventory_shelves(*, rack:inventory_racks(*, zone:inventory_zones(*, warehouse:inventory_warehouses(*)))))'
      )
      .eq('tenant_id', tenantId)
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  }

  static async updateStock(
    tenantId: string,
    productId: string,
    binId: string,
    batchId: string | null,
    quantityDelta: number,
    type: string,
    notes?: string,
    performedBy?: string
  ) {
    const admin = await getAdminClient();

    // 1. Get current inventory stock for this bin/batch
    let query = admin
      .from('inventory_stock')
      .select('id, quantity')
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .eq('bin_id', binId);

    if (batchId) {
      query = query.eq('batch_id', batchId);
    } else {
      query = query.is('batch_id', null);
    }

    const { data: currentInv, error: getError } = await query.maybeSingle();

    if (getError) throw getError;

    let inventoryId: string;
    let newQuantity: number;

    if (!currentInv) {
      // Create new inventory record
      newQuantity = Math.max(0, quantityDelta);
      const { data: newInv, error: createError } = await admin
        .from('inventory_stock')
        .insert({
          tenant_id: tenantId,
          product_id: productId,
          bin_id: binId,
          batch_id: batchId,
          quantity: newQuantity,
        })
        .select()
        .single();

      if (createError) throw createError;
      inventoryId = newInv.id;
    } else {
      // Update existing
      inventoryId = currentInv.id;
      newQuantity = Math.max(0, currentInv.quantity + quantityDelta);
      const { error: updateError } = await admin
        .from('inventory_stock')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', inventoryId);

      if (updateError) throw updateError;
    }

    // 2. Log stock movement
    const { error: logError } = await admin.from('inventory_stock_movements').insert({
      tenant_id: tenantId,
      stock_id: inventoryId,
      type,
      quantity: quantityDelta,
      notes,
      performed_by: performedBy,
    });

    if (logError) throw logError;

    // 3. Update total product stock (cached in products table for performance)
    const { data: totalData } = await admin
      .from('inventory_stock')
      .select('quantity')
      .eq('tenant_id', tenantId)
      .eq('product_id', productId);

    const totalQuantity = (totalData || []).reduce(
      (sum: number, item: any) => sum + Number(item.quantity),
      0
    );

    await admin.from('products').update({ stock_quantity: totalQuantity }).eq('id', productId);

    return { inventoryId, newQuantity, totalQuantity };
  }
}
