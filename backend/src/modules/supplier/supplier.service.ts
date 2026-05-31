import { AppError } from '../../middlewares/error.js';
import { InventoryService } from '../inventory/inventory.service.js';
import logger from '../../services/logger.js';
// eslint-disable-line import/order

import { SupplierRepository } from './supplier.repository.js';
import {
  createSupplierSchema,
  createPurchaseOrderSchema,
  receivePurchaseOrderSchema,
} from './supplier.validator.js';

const supplierRepo = new SupplierRepository();

export class SupplierService {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  async getSuppliers() {
    return await supplierRepo.findAllSuppliers();
  }

  async getSupplierById(id: string) {
    return await supplierRepo.findSupplierById(id);
  }

  async createSupplier(data: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const validatedData = createSupplierSchema.parse(data);
    return await supplierRepo.createSupplier(validatedData);
  }

  // --- Purchase Orders ---
  // eslint-disable-line @typescript-eslint/no-explicit-any

  async getPurchaseOrders(supplierId?: string) {
    return await supplierRepo.findAllPurchaseOrders(supplierId);
  }

  async createPurchaseOrder(data: any, userId: string) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const validatedData = createPurchaseOrderSchema.parse(data);

    // 1. Calculate total
    const totalAmount = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );

    // 2. Create PO
    const poData = {
      supplier_id: validatedData.supplierId,
      status: 'pending',
      total_amount: totalAmount,
      expected_delivery: validatedData.expectedDelivery,
      created_by: userId,
    };
    const po = await supplierRepo.createPurchaseOrder(poData);

    // 3. Create PO Items
    const itemsToInsert = validatedData.items.map((item) => ({
      purchase_order_id: po.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_cost: item.unitCost,
    }));
    await supplierRepo.createPurchaseOrderItems(itemsToInsert);

    return po;
  }

  async receivePurchaseOrder(poId: string, warehouseId: string, userId: string) {
    const validatedData = receivePurchaseOrderSchema.parse({ warehouseId });

    // 1. Fetch PO and items
    const po = await supplierRepo.findPurchaseOrderById(poId);

    if (po.status === 'received') throw new AppError('PO is already received', 400);

    // 2. Update PO status
    await supplierRepo.updatePurchaseOrderStatus(poId, 'received');

    // 3. Sync with Inventory Service automatically!
    for (const item of po.purchase_order_items) {
      await InventoryService.adjustStock({
        productId: item.product_id,
        warehouseId: validatedData.warehouseId, // Which warehouse the goods arrived at
        quantity: item.quantity,
        type: 'in',
        referenceType: 'purchase_order',
        referenceId: po.id,
        notes: `Received from PO ${po.id}`,
        userId: userId,
      });
    }

    logger.info(
      `[Supplier] PO ${poId} marked as received and inventory synced to warehouse ${validatedData.warehouseId}`
    );
    return { success: true, message: 'PO received and inventory updated successfully' };
  }
}
