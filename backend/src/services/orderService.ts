import { OrderRepository } from '../repositories/orderRepository.js';
import { AppError } from '../middlewares/error.js';

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

  async getMyOrders(userId: string) {
    return await orderRepo.findByUserId(userId);
  }

  async createOrder(userId: string | undefined, orderData: any) {
    const { items, totalAmount, shippingAddress } = orderData;
    const paymentMethod = orderData.paymentMethod || orderData.payment_method;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);
    const tax = Math.round(subtotal * 0.18);
    const orderNumber = orderData.order_number || `ORD-${Date.now()}`;

    const dbOrderData = {
      user_id: userId || orderData.user_id || null, // Allow NULL for walk-in/POS
      order_number: orderNumber,
      status: orderData.status || 'pending',
      payment_status: orderData.payment_status || (paymentMethod === 'razorpay' ? 'paid' : 'pending'),
      subtotal,
      tax_amount: tax,
      total_amount: totalAmount || (subtotal + tax),
      payment_method: paymentMethod || 'cash',
      customer_name: shippingAddress?.name || 'Walk-in Customer',
      customer_email: shippingAddress?.email || 'walkin@customer.com'
    };

    return await orderRepo.create(dbOrderData, items);
  }

  async updateOrderStatus(id: string, updateData: any) {
    const { status, courier, trackingId } = updateData;
    
    if (status) {
      await orderRepo.update(id, { status: status.toLowerCase() });
    }

    if (courier || trackingId) {
      await orderRepo.updateShipment(id, courier, trackingId);
    }

    return { success: true };
  }
}
