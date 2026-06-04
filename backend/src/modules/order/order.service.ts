import { AppError } from '../../middlewares/error.js';
import { InventoryService } from '../inventory/inventory.service.js';
import { AuditService } from '../../services/auditService.js';
import { getAdminClient } from '../../config/supabase.js';
import logger from '../../services/logger.js';
import { JobService } from '../../services/jobService.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars
import { AuthService } from '../auth/auth.service.js';
import { eventBus } from '../../core/events/EventBus.js';
import { DomainEvents } from '../../core/events/events.js';
import { MarketingService } from '../marketing/marketing.service.js';
// eslint-disable-line import/order

// eslint-disable-line import/order
import { OrderRepository } from './order.repository.js';

const orderRepo = new OrderRepository();

export class OrderService {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  async getAllOrders(filters: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return await orderRepo.findAll(filters);
  }

  async getOrderById(id: string) {
    const order = await orderRepo.findById(id);
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async getOrderByIdForUser(id: string, userId: string, email?: string, role?: string) {
    const order = await this.getOrderById(id);
    const isAdmin = role === 'admin' || role === 'super-admin';
    const ownsOrder = order.user_id === userId || (email && order.customer_email === email);

    if (!isAdmin && !ownsOrder) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async getMyOrders(userId: string, email?: string) {
    return await orderRepo.findByUserId(userId, email);
  }
  // eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any

  async createOrder(userId: string | undefined, orderData: any, userEmail?: string) {
    // eslint-disable-line complexity
    const { items, shippingAddress } = orderData;
    const paymentMethod = orderData.paymentMethod || orderData.payment_method;

    let finalUserId = userId;

    // Handle Guest Checkout Auto-Account Creation
    if (!finalUserId && orderData.email && orderData.password) {
      try {
        const authService = new AuthService();
        const customerName = shippingAddress?.full_name || shippingAddress?.name || 'Guest User';
        const newUser = await authService.customerSignup(
          orderData.email,
          orderData.password,
          customerName
        );
        if (newUser?.user?.id) {
          finalUserId = newUser.user.id;
          // eslint-disable-line @typescript-eslint/no-explicit-any
          logger.info(`[OrderService] Auto-created guest account: ${finalUserId}`);
        }
      } catch (err: any) {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        logger.error(
          `[OrderService] Failed to auto-create guest account for ${orderData.email}:`,
          err
        );
        // Proceed as pure anonymous guest if account creation fails (e.g., email exists)
      }
    }

    const admin = await getAdminClient();

    // Determine warehouse
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

    const orderNumber = orderData.order_number || `ORD-${Date.now()}`;

    // Use Transactional RPC for atomic creation via Repository
    let order;
    try {
      order = await orderRepo.createCheckoutOrder({
        p_user_id: finalUserId || null,
        p_order_number: orderNumber,
        p_status: orderData.status || 'pending',
        p_payment_status: 'pending',
        p_payment_method: paymentMethod || 'cash',
        p_shipping_address: shippingAddress,
        p_customer_name: shippingAddress?.full_name || shippingAddress?.name || 'Walk-in Customer',
        p_customer_email:
          // eslint-disable-line @typescript-eslint/no-explicit-any
          shippingAddress?.email || orderData.email || userEmail || 'walkin@customer.com',
        p_shipping_amount: (orderData.shippingFee || 0) - (orderData.discountAmount || 0),
        p_warehouse_id: warehouseId,
        p_items: items.map((i: any) => ({
          // eslint-disable-line @typescript-eslint/no-explicit-any
          productId: i.productId || i.product_id,
          quantity: Number(i.quantity),
        })),
      });
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      throw new AppError(error.message, 400);
    }

    // Adjust shipping and discount in DB after RPC creates it
    if (orderData.discountAmount > 0) {
      await orderRepo.updateOrderAmounts(order.id, {
        discount_amount: orderData.discountAmount,
        shipping_amount: orderData.shippingFee || 0,
      });
    }

    // Record coupon usage
    if (orderData.couponId) {
      const marketingSvc = new MarketingService();
      await marketingSvc
        .recordUsage(orderData.couponId, finalUserId || 'guest', order.id, orderData.discountAmount)
        .catch((e) => logger.error('[OrderService] Failed to record coupon usage:', e));
    }

    // 2. Log Activity
    await AuditService.logOrderActivity({
      order_id: order.id,
      status: order.status,
      notes: 'Order created via transactional RPC',
      performed_by: userId,
    });

    // 3. System Audit Log
    await AuditService.log({
      user_id: userId,
      action: 'CREATE_ORDER',
      module: 'orders',
      entity_id: order.id,
      new_data: { order_number: orderNumber, total: order.total_amount },
    });

    // 4. Publish Domain Event
    eventBus.publish(DomainEvents.ORDER_CREATED, {
      orderId: order.id,
      orderNumber: orderNumber,
      customerId: finalUserId || 'guest',
      customerName: order.customer_name,
      email: order.customer_email,
      phone: shippingAddress?.phone || orderData.phone,
      totalAmount: order.total_amount,
    });

    // eslint-disable-line @typescript-eslint/no-unused-vars
    // 5. Emit Real-time events
    try {
      const { emitToRoom, notifyAdmins } = await import('../../sockets/index.js');
      // eslint-disable-line @typescript-eslint/no-unused-vars
      notifyAdmins('new_order', {
        id: order.id,
        order_number: orderNumber,
        total: order.total_amount,
        customer_name: order.customer_name,
      });
    } catch (err) {
      logger.error('[OrderService] Failed to emit socket event for new order:', err);
    }

    // eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any
    return order;
  }

  async updateOrderStatus(id: string, updateData: any, userId?: string) {
    // eslint-disable-line complexity
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

      await orderRepo.update(id, { status: newStatus }, userId);

      // Audit Logging for ALL status changes
      await AuditService.logOrderActivity({
        order_id: id,
        status: newStatus,
        notes: notes || `Order status updated to ${newStatus}`,
        performed_by: userId,
      });

      await AuditService.log({
        user_id: userId,
        action: 'UPDATE_ORDER_STATUS',
        module: 'orders',
        entity_id: id,
        old_data: { status: currentStatus },
        new_data: { status: newStatus, notes },
      });

      // Handle Stock Reversal for Cancelled/Returned
      if (
        ['cancelled', 'returned'].includes(newStatus) &&
        ['pending', 'confirmed', 'packed', 'shipped', 'delivered'].includes(currentStatus)
      ) {
        try {
          const orderItems = order.order_items; // Use already loaded items

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
          logger.error('Failed to restock items on status change:', stockErr);
        }
      }

      // Publish Domain Event for Status Change
      eventBus.publish(DomainEvents.ORDER_STATUS_UPDATED, {
        orderId: id,
        orderNumber: order.order_number,
        status: newStatus,
        customerId: order.user_id || 'guest',
        notes: notes,
        phone: order.shipping_address?.phone || order.phone,
        email: order.customer_email,
      });

      if (newStatus === 'delivered') {
        eventBus.publish(DomainEvents.ORDER_COMPLETED, {
          orderId: id,
          customerId: order.user_id || 'guest',
        });
      } else if (newStatus === 'cancelled') {
        eventBus.publish(DomainEvents.ORDER_CANCELLED, {
          orderId: id,
          reason: notes || 'User cancelled',
        });
      }
    }

    // 5. Emit Real-time events
    try {
      const { emitToRoom, notifyAdmins } = await import('../../sockets/index.js');
      if (order.user_id) {
        emitToRoom(`user:${order.user_id}`, 'order_updated', {
          id: id,
          status: status || order.status,
          order_number: order.order_number,
        });
      }
      notifyAdmins('order_status_change', {
        id: id,
        status: status || order.status,
        order_number: order.order_number,
      });
    } catch (err) {
      logger.error('[OrderService] Failed to emit socket event for order update:', err);
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
}
