import { InventoryService } from '../modules/inventory/inventory.service.js';
import { OrderService } from '../modules/order/order.service.js';
import { OrderRepository } from '../modules/order/order.repository.js';
import { AuditService } from '../services/auditService.js';
import { AppError } from '../middlewares/error.js';
import { getAdminClient } from '../config/supabase.js';
import logger from '../services/logger.js';
import { RefundWorkflow } from './refundWorkflow.service.js';

const orderRepo = new OrderRepository();

export class InventoryWorkflow {
  static async reserveStock(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    userId?: string;
  }) {
    return await InventoryService.reserveStock(data);
  }

  static async releaseReservation(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reservationId: string;
  }) {
    return await InventoryService.releaseReservation(data);
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
    return await InventoryService.adjustStock(data);
  }

  static async transferStock(data: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    notes?: string;
    userId?: string;
  }) {
    // Phase 4 will add transactional safety here
    await InventoryService.adjustStock({
      productId: data.productId,
      warehouseId: data.fromWarehouseId,
      quantity: -Math.abs(data.quantity),
      type: 'transfer',
      notes: data.notes || `Transfer to ${data.toWarehouseId}`,
      userId: data.userId,
    });
    try {
      return await InventoryService.adjustStock({
        productId: data.productId,
        warehouseId: data.toWarehouseId,
        quantity: Math.abs(data.quantity),
        type: 'transfer',
        notes: data.notes || `Transfer from ${data.fromWarehouseId}`,
        userId: data.userId,
      });
    } catch (error) {
      // Rollback
      await InventoryService.adjustStock({
        productId: data.productId,
        warehouseId: data.fromWarehouseId,
        quantity: Math.abs(data.quantity),
        type: 'adjustment',
        notes: `Rollback: Transfer failed`,
        userId: data.userId,
      });
      throw error;
    }
  }

  static async processReturn(
    id: string,
    data: {
      items: { productId: string; quantity: number }[];
      warehouseId: string;
      reason: string;
      refundAmount?: number;
      userId: string;
    }
  ) {
    // Extract processReturn from OrderService here
    const order = await orderRepo.getById(id);
    if (!order) throw new AppError('Order not found', 404);

    for (const item of data.items) {
      await InventoryService.adjustStock({
        productId: item.productId,
        warehouseId: data.warehouseId,
        quantity: item.quantity,
        type: 'return',
        referenceType: 'order',
        referenceId: id,
        notes: `Customer return: ${data.reason}`,
        userId: data.userId,
      });
    }

    await AuditService.logOrderActivity({
      order_id: id,
      status: 'returned',
      notes: `Return processed for ${data.items.length} items. Reason: ${data.reason}`,
      performed_by: data.userId,
    });

    if (data.refundAmount && data.refundAmount > 0) {
      logger.info(`Initiating refund of ₹${data.refundAmount} for order ${order.order_number}`);
      await RefundWorkflow.processRefund(id, data.refundAmount, data.reason, data.userId);
    }

    await orderRepo.update(id, { status: 'returned' });
    return { success: true };
  }
}
