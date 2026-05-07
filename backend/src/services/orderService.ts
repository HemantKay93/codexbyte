import { OrderRepository } from '../repositories/orderRepository.js';
import { AppError } from '../middlewares/error.js';
import { InventoryService } from './inventoryService.js';
import { AuditService } from './auditService.js';
import { getAdminClient } from '../config/supabase.js';
import { NotificationService } from './notificationService.js';
import logger from './logger.js';
import { notificationQueue, emailQueue } from '../jobs/index.js';

const orderRepo = new OrderRepository();

export class OrderService {
  async getAllOrders(filters: any) {
    return await orderRepo.findAll(filters);
  }

  async getOrderById(id: string) {
    const order = await orderRepo.findById(id);
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async getMyOrders(userId: string, email?: string) {
    return await orderRepo.findByUserId(userId, email);
  }

  async createOrder(userId: string | undefined, orderData: any) {
    const { items, totalAmount, shippingAddress } = orderData;
    const paymentMethod = orderData.paymentMethod || orderData.payment_method;

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.18);
    const orderNumber = orderData.order_number || `ORD-${Date.now()}`;

    const dbOrderData = {
      user_id: userId || orderData.user_id || null, // Allow NULL for walk-in/POS
      order_number: orderNumber,
      status: orderData.status || 'pending',
      payment_status:
        orderData.payment_status || (paymentMethod === 'razorpay' ? 'paid' : 'pending'),
      subtotal,
      tax_amount: tax,
      total_amount: totalAmount || subtotal + tax,
      payment_method: paymentMethod || 'cash',
      customer_name: shippingAddress?.name || 'Walk-in Customer',
      customer_email: shippingAddress?.email || 'walkin@customer.com',
    };

    const order = await orderRepo.create(dbOrderData, items);

    // 1. Inventory & Activity Tracking
    const admin = await getAdminClient();
    const { data: defaultWarehouse } = await admin
      .from('warehouses')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single();

    for (const item of items) {
      try {
        await InventoryService.adjustStock({
          productId: item.productId,
          warehouseId: orderData.warehouseId || defaultWarehouse?.id,
          quantity: -item.quantity,
          type: 'out',
          referenceType: 'order',
          referenceId: order.id,
          userId: userId,
        });
      } catch (err) {
        console.error(`Failed to reduce stock for product ${item.productId}:`, err);
        // In production, you might want to rollback or queue for manual review
      }
    }

    // 2. Log Activity
    await AuditService.logOrderActivity({
      order_id: order.id,
      status: dbOrderData.status,
      notes: 'Order created',
      performed_by: userId,
    });

    // 3. System Audit Log
    await AuditService.log({
      user_id: userId,
      action: 'CREATE_ORDER',
      module: 'orders',
      entity_id: order.id,
      new_data: { order_number: orderNumber, total: dbOrderData.total_amount },
    });

    // 4. Queue Customer Email (Phase 4 background job)
    await emailQueue.add('order-confirmation', {
      to: dbOrderData.customer_email,
      subject: `Order Confirmed: ${orderNumber}`,
      html: `<h1>Thank you for your order!</h1><p>Your order #${orderNumber} is being processed.</p>`,
    });

    return order;
  }

  async updateOrderStatus(id: string, updateData: any, userId?: string) {
    const { status, courier, trackingId, notes } = updateData;
    const admin = await getAdminClient();
    const order = await orderRepo.getById(id);

    if (!order) throw new AppError('Order not found', 404);

    const validTransitions: { [key: string]: string[] } = {
      pending: ['confirmed', 'cancelled', 'shipped'],
      confirmed: ['packed', 'cancelled', 'shipped'],
      packed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned'],
      returned: ['refunded'],
      cancelled: [],
    };

    if (status) {
      const currentStatus = order.status.toLowerCase();
      const newStatus = status.toLowerCase();

      if (currentStatus !== newStatus && !validTransitions[currentStatus]?.includes(newStatus)) {
        throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
      }

      await orderRepo.update(id, { status: newStatus });

      // Handle Stock Reversal for Cancelled/Returned
      if (
        ['cancelled', 'returned'].includes(newStatus) &&
        ['pending', 'confirmed', 'packed', 'shipped', 'delivered'].includes(currentStatus)
      ) {
        try {
          const { data: orderItems } = await admin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', id);

          const { data: defaultWarehouse } = await admin
            .from('warehouses')
            .select('id')
            .eq('is_active', true)
            .limit(1)
            .single();

          if (orderItems) {
            for (const item of orderItems) {
              await InventoryService.adjustStock({
                productId: item.product_id,
                warehouseId: updateData.warehouseId || defaultWarehouse?.id,
                quantity: item.quantity, // Positive to restock
                type: newStatus === 'returned' ? 'return' : 'adjustment',
                referenceType: 'order',
                referenceId: id,
                notes: `Stock restocked due to order ${newStatus}`,
                userId: userId,
              });
            }
          }
        } catch (stockErr) {
          console.error('Failed to restock items on status change:', stockErr);
        }

        // Queue Notification for critical status changes (Phase 4 background job)
        try {
          const orderData = await admin.from('orders').select('order_number').eq('id', id).single();
          if (orderData && orderData.data) {
            const isCritical = ['cancelled', 'returned'].includes(newStatus);
            await notificationQueue.add('order-notification', {
              title: `Order ${newStatus.toUpperCase()}`,
              message: `Order #${orderData.data.order_number} has been ${newStatus}.${notes ? ` Note: ${notes}` : ''}`,
              type: isCritical ? 'error' : 'info',
              priority: isCritical ? 'high' : 'medium',
            });
          }
        } catch (notifErr) {
          console.error('Failed to queue order notification:', notifErr);
        }

        // Audit Logging
        await AuditService.logOrderActivity({
          order_id: id,
          status: newStatus,
          notes: notes || `Status updated to ${newStatus}`,
          performed_by: userId,
        });

        await AuditService.log({
          user_id: userId,
          action: 'ORDER_STATUS_UPDATE',
          module: 'orders',
          entity_id: id,
          new_data: { status: newStatus, notes },
        });
      }

      // Log Activity
      await AuditService.logOrderActivity({
        order_id: id,
        status: newStatus,
        notes: notes || `Order status updated to ${newStatus}`,
        performed_by: userId,
      });

      // Audit Log
      await AuditService.log({
        user_id: userId,
        action: 'UPDATE_ORDER_STATUS',
        module: 'orders',
        entity_id: id,
        old_data: { status: currentStatus },
        new_data: { status: newStatus },
      });
    }

    if (courier || trackingId) {
      await orderRepo.updateShipment(id, courier, trackingId);

      await AuditService.logOrderActivity({
        order_id: id,
        status: order.status,
        notes: `Shipment updated: ${courier} (${trackingId})`,
        performed_by: userId,
      });
    }

    return { success: true };
  }

  async processReturn(
    id: string,
    data: {
      items: { productId: string; quantity: number }[];
      warehouseId: string;
      reason: string;
      refundAmount?: number;
      userId: string;
    }
  ) {
    const admin = await getAdminClient();

    // 1. Update Order Status if needed (or keep as 'returned' / 'partially_returned')
    const order = await orderRepo.getById(id);
    if (!order) throw new AppError('Order not found', 404);

    // 2. Restock items to warehouse
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

    // 3. Log Activity
    await AuditService.logOrderActivity({
      order_id: id,
      status: 'returned',
      notes: `Return processed for ${data.items.length} items. Reason: ${data.reason}`,
      performed_by: data.userId,
    });

    // 4. Financial Reconciliation Placeholder
    if (data.refundAmount && data.refundAmount > 0) {
      // Here you would call Stripe/Razorpay refund API
      logger.info(`Initiating refund of ₹${data.refundAmount} for order ${order.order_number}`);
    }

    await orderRepo.update(id, { status: 'returned' });

    return { success: true };
  }
}
