import logger from '../../services/logger.js';
import { getAdminClient } from '../../config/supabase.js';
import { NotificationService } from '../../services/notificationService.js';
import { OrderRepository } from '../order/order.repository.js';

const orderRepo = new OrderRepository();

export class ShipmentService {
  /**
   * Sync tracking status from 3rd party providers (Mock implementation)
   */
  static async syncTrackingStatus(orderId: string) {
    try {
      const order = await orderRepo.getById(orderId);

      if (!order || !order.tracking_id) return;

      logger.info(`Syncing shipment for Order #${order.order_number} (ID: ${order.tracking_id})`);

      // Mock response from tracking provider (AfterShip/Shiprocket)
      const mockStatuses = ['in_transit', 'out_for_delivery', 'delivered'];
      const currentStatusIndex = mockStatuses.indexOf(order.shipment_status || 'shipped');
      const nextStatus = mockStatuses[currentStatusIndex + 1] || order.shipment_status;

      if (nextStatus !== order.shipment_status) {
        const admin = await getAdminClient();
        await admin
          .from('orders')
          .update({ shipment_status: nextStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId);

        // Notify if delivered
        if (nextStatus === 'delivered') {
          await NotificationService.send({
            title: 'Order Delivered',
            message: `Order #${order.order_number} has been successfully delivered to the customer.`,
            type: 'success',
            priority: 'medium',
            metadata: { module: 'logistics', orderNumber: order.order_number },
          });

          // Also update main order status
          await admin.from('orders').update({ status: 'delivered' }).eq('id', orderId);
        }

        logger.info(`Updated shipment status for #${order.order_number} to ${nextStatus}`);
      }
    } catch (err) {
      logger.error('Failed to sync shipment status:', err);
    }
  }

  /**
   * Run background sync for all active shipments
   */
  static async syncAllActiveShipments() {
    const admin = await getAdminClient();
    const { data: activeOrders } = await admin.from('orders').select('id').eq('status', 'shipped');

    if (activeOrders) {
      for (const order of activeOrders) {
        await this.syncTrackingStatus(order.id);
      }
    }
  }
}
