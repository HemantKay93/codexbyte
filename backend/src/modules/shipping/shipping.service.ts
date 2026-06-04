import logger from '../../services/logger.js';
import { getAdminClient } from '../../config/supabase.js';
import { NotificationService } from '../../services/notificationService.js';
import { OrderRepository } from '../order/order.repository.js';

import { ShiprocketProvider } from './providers/shiprocket.provider.js';

const orderRepo = new OrderRepository();

export class ShipmentService {
  private static provider: ShiprocketProvider;

  private static getProvider() {
    if (!this.provider) {
      // Fetch these from ENV in production
      this.provider = new ShiprocketProvider(
        process.env.SHIPROCKET_EMAIL || 'admin@codexbyte.com',
        process.env.SHIPROCKET_PASSWORD || 'secret'
      );
    }
    return this.provider;
  }

  static async createShipment(orderId: string) {
    try {
      const order = await orderRepo.getById(orderId);
      if (!order) throw new Error('Order not found');

      const provider = this.getProvider();
      const shipmentData = await provider.createShipment(order);

      const admin = await getAdminClient();
      await admin
        .from('orders')
        .update({
          tracking_id: shipmentData.provider_order_id,
          shipment_status: 'shipped',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      logger.info(`Successfully created shipment for Order #${order.order_number}`);
      return shipmentData;
    } catch (error) {
      logger.error('Failed to create shipment:', error);
      throw error;
    }
  }

  /**
   * Sync tracking status from 3rd party providers
   */
  static async syncTrackingStatus(orderId: string) {
    try {
      const order = await orderRepo.getById(orderId);

      if (!order || !order.tracking_id) return;

      logger.info(`Syncing shipment for Order #${order.order_number} (ID: ${order.tracking_id})`);

      const provider = this.getProvider();
      // Assume tracking_id stores the shipment_id for tracking
      const newStatus = await provider.trackShipment(order.tracking_id);

      if (newStatus && newStatus !== order.shipment_status) {
        const admin = await getAdminClient();
        await admin
          .from('orders')
          .update({ shipment_status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId);

        // Notify if delivered
        if (newStatus === 'delivered') {
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

        logger.info(`Updated shipment status for #${order.order_number} to ${newStatus}`);
      }
    } catch (err) {
      logger.error('Failed to sync shipment status:', err);
    }
  }

  /**
   * Webhook handler for status updates pushed from provider
   */
  static async handleWebhook(payload: any) {
    try {
      const trackingId = payload.shipment_id || payload.order_id;
      const status = payload.current_status;

      const admin = await getAdminClient();
      const { data: order } = await admin
        .from('orders')
        .select('id, order_number, shipment_status')
        .eq('tracking_id', trackingId)
        .single();

      if (order) {
        // Just trigger a sync to let the provider mapping handle state logic
        await this.syncTrackingStatus(order.id);
      }
    } catch (error) {
      logger.error('Webhook processing failed', error);
    }
  }

  /**
   * Run background sync for all active shipments
   */
  static async syncAllActiveShipments() {
    const admin = await getAdminClient();
    const { data: activeOrders } = await admin
      .from('orders')
      .select('id')
      .in('shipment_status', ['shipped', 'in_transit', 'out_for_delivery']);

    if (activeOrders) {
      for (const order of activeOrders) {
        await this.syncTrackingStatus(order.id);
      }
    }
  }
}
