import Razorpay from 'razorpay';
import logger from '../services/logger.js';
import { getAdminClient } from '../config/supabase.js';
import { AppError } from '../middlewares/error.js';
import { NotificationWorkflow } from './notificationWorkflow.service.js';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

export class RefundWorkflow {
  static async processRefund(orderId: string, refundAmount: number, notes?: string, performedBy?: string) {
    if (!razorpay) {
      logger.warn('[RefundWorkflow] Razorpay not configured. Skipping actual payment gateway refund.');
    }

    const admin = await getAdminClient();
    const { data: order, error } = await admin.from('orders').select('*').eq('id', orderId).single();

    if (error || !order) {
      throw new AppError('Order not found for refund', 404);
    }

    // 1. Process Gateway Refund
    let gatewayRefundId = null;
    if (razorpay && order.payment_intent_id) {
      try {
        const refund = await razorpay.payments.refund(order.payment_intent_id, {
          amount: Math.round(refundAmount * 100),
          notes: {
            reason: notes || 'Customer Requested Refund'
          }
        });
        gatewayRefundId = refund.id;
        logger.info(`[RefundWorkflow] Razorpay refund successful: ${refund.id}`);
      } catch (refundErr: any) {
        logger.error('[RefundWorkflow] Razorpay refund failed:', refundErr);
        throw new AppError(`Payment gateway refund failed: ${refundErr.description || refundErr.message}`, 500);
      }
    } else {
      logger.info(`[RefundWorkflow] Simulated refund of ₹${refundAmount} for order ${order.order_number}`);
    }

    // 2. Log Refund in Database
    await admin.from('refunds').insert({
      order_id: orderId,
      amount: refundAmount,
      gateway_refund_id: gatewayRefundId,
      reason: notes,
      status: 'completed',
      processed_by: performedBy
    });

    // 3. Notify Customer
    await NotificationWorkflow.notifyCustomerOrderUpdate({
      orderNumber: order.order_number,
      status: 'refunded',
      notes: `A refund of ₹${refundAmount} has been processed. ${notes || ''}`,
      phone: order.shipping_address?.phone || order.phone,
      email: order.customer_email,
      userId: order.user_id
    });

    return { success: true, refundId: gatewayRefundId };
  }
}
