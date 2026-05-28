import { OrderService } from '../modules/order/order.service.js';
import { InventoryService } from '../modules/inventory/inventory.service.js';
import { AppError } from '../middlewares/error.js';
import { JobService } from '../services/jobService.js';
import { getAdminClient } from '../config/supabase.js';
import logger from '../services/logger.js';

const orderService = new OrderService();

export class OrderWorkflow {
  static async processCheckout(userId: string | undefined, orderData: any, userEmail?: string) {
    const admin = await getAdminClient();
    const { items, shippingAddress } = orderData;
    let warehouseId = orderData.warehouseId;

    if (!warehouseId) {
      const { data: defaultWh } = await admin
        .from('warehouses')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();
      warehouseId = defaultWh?.id;
    }

    // 1. Validate & Reserve Inventory
    const reservations: string[] = [];
    try {
      for (const item of items) {
        const { reservationId } = await InventoryService.reserveStock({
          productId: item.productId || item.product_id,
          warehouseId,
          quantity: Number(item.quantity),
          userId,
        });
        reservations.push(reservationId);
      }
    } catch (err: any) {
      // Rollback successful reservations (future: transaction handling)
      throw new AppError(`Order failed during inventory reservation: ${err.message}`, 400);
    }

    try {
      // 2. Create Order & Payment (orchestrates multiple steps)
      const order = await orderService.createOrder(userId, orderData, userEmail);

      // 3. Commit reservations (convert reserved to actual deductions)
      for (const item of items) {
        await InventoryService.adjustStock({
          productId: item.productId || item.product_id,
          warehouseId,
          quantity: -Number(item.quantity),
          type: 'out',
          referenceType: 'order',
          referenceId: order.id,
          userId,
        });
      }
      // 4. Dispatch analytics event asynchronously
      await JobService.dispatchAnalyticsEvent('order_created', {
        orderId: order.id,
        userId,
        totalAmount: order.total_amount,
      });

      return order;
    } catch (orderErr: any) {
      // Rollback reservations
      logger.error('[OrderWorkflow] Order creation failed, rolling back reservations:', orderErr);
      for (const rId of reservations) {
        try {
          // We need to release the reservation. The reservations array just has the IDs,
          // but our releaseReservation method requires productId, warehouseId, and quantity.
          // Since we have the items array, we can use it to reconstruct the release.
          // Note: This assumes 1:1 mapping of reservations to items.
          const index = reservations.indexOf(rId);
          if (index !== -1) {
            const item = items[index];
            await InventoryService.releaseReservation({
              productId: item.productId || item.product_id,
              warehouseId,
              quantity: Number(item.quantity),
              reservationId: rId,
            });
          }
        } catch (rollbackErr) {
          logger.error(`[OrderWorkflow] Failed to rollback reservation ${rId}:`, rollbackErr);
        }
      }
      throw new AppError(`Order processing failed: ${orderErr.message}`, 500);
    }
  }
}
