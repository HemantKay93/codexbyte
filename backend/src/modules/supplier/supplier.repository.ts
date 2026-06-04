import { getAdminClient } from '../../config/supabase.js';
import { AppError } from '../../middlewares/error.js';
import logger from '../../services/logger.js';

export class SupplierRepository {
  async findAllSuppliers() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Failed to fetch suppliers', 500);
    return data;
  }

  async findSupplierById(id: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin.from('suppliers').select('*').eq('id', id).single();

    if (error || !data) throw new AppError('Supplier not found', 404);
    return data;
  }

  async createSupplier(supplierData: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();

    // Only send columns that exist in the suppliers table.
    // This prevents PGRST204 "column not found in schema cache" errors
    // if the validator includes optional fields the table doesn't have yet.
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const safePayload: Record<string, any> = {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      name: supplierData.name,
      status: supplierData.status ?? 'active',
    };
    if (supplierData.contact_name !== undefined)
      safePayload.contact_name = supplierData.contact_name;
    if (supplierData.email !== undefined && supplierData.email !== '')
      safePayload.email = supplierData.email;
    // phone / address are optional — include only if they exist as columns
    // (added via: ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone TEXT, ADD COLUMN IF NOT EXISTS address TEXT)
    if (supplierData.phone !== undefined) safePayload.phone = supplierData.phone;
    if (supplierData.address !== undefined) safePayload.address = supplierData.address;

    const { data: supplier, error } = await admin
      .from('suppliers')
      .insert(safePayload)
      .select()
      .single();

    if (error) {
      logger.error('[SupplierRepository] createSupplier DB error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        safePayload,
      });
      throw new AppError(`Failed to create supplier: ${error.message}`, 500);
    }
    return supplier;
  }

  async findAllPurchaseOrders(supplierId?: string) {
    const admin = await getAdminClient();
    let query = admin
      .from('purchase_orders')
      .select('*, suppliers(name), purchase_order_items(*)')
      .order('created_at', { ascending: false });

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    const { data, error } = await query;
    if (error) throw new AppError('Failed to fetch POs', 500);
    return data;
  }

  async findPurchaseOrderById(poId: string) {
    const admin = await getAdminClient();
    const { data: po, error: poError } = await admin
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('id', poId)
      .single();

    if (poError || !po) throw new AppError('PO not found', 404);
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return po;
  }

  async createPurchaseOrder(poData: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { data: po, error: poError } = await admin
      .from('purchase_orders')
      .insert(poData)
      .select()
      .single();

    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (poError || !po) throw new AppError('Failed to create PO', 500);
    return po;
  }

  async createPurchaseOrderItems(itemsToInsert: any[]) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { error: itemsError } = await admin.from('purchase_order_items').insert(itemsToInsert);

    if (itemsError) throw new AppError('Failed to create PO items', 500);
  }

  async updatePurchaseOrderStatus(poId: string, status: string) {
    const admin = await getAdminClient();
    const { error: updateError } = await admin
      .from('purchase_orders')
      .update({ status, received_at: new Date().toISOString() })
      .eq('id', poId);

    if (updateError) throw new AppError('Failed to update PO status', 500);
  }
}
