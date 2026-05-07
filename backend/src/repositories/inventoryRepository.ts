import { supabase, getAdminClient } from '../config/supabase.js';

export class InventoryRepository {
  async getInventoryByProduct(productId: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, warehouses(*)')
      .eq('product_id', productId);
    
    if (error) throw error;
    return data;
  }

  async updateStock(productId: string, warehouseId: string, quantityDelta: number, type: string, notes?: string, performedBy?: string) {
    const admin = await getAdminClient();
    
    // 1. Get current inventory
    const { data: currentInv, error: getError } = await admin
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .maybeSingle();
    
    if (getError) throw getError;

    let inventoryId: string;
    let newQuantity: number;

    if (!currentInv) {
      // Create new inventory record
      newQuantity = Math.max(0, quantityDelta);
      const { data: newInv, error: createError } = await admin
        .from('inventory')
        .insert({
          product_id: productId,
          warehouse_id: warehouseId,
          quantity: newQuantity
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
        .from('inventory')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', inventoryId);
      
      if (updateError) throw updateError;
    }

    // 2. Log stock movement
    const { error: logError } = await admin
      .from('stock_movements')
      .insert({
        inventory_id: inventoryId,
        type,
        quantity: quantityDelta,
        notes,
        performed_by: performedBy
      });

    if (logError) throw logError;

    // 3. Update total product stock (cached in products table for performance)
    const { data: totalData } = await admin
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId);
    
    const totalQuantity = (totalData || []).reduce((sum, item) => sum + item.quantity, 0);
    
    await admin
      .from('products')
      .update({ stock_quantity: totalQuantity })
      .eq('id', productId);

    return { inventoryId, newQuantity, totalQuantity };
  }
}
