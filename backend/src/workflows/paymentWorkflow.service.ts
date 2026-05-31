import crypto from 'node:crypto';

import Razorpay from 'razorpay';

import { getAdminClient } from '../config/supabase.js';
import { AppError } from '../middlewares/error.js';
import logger from '../services/logger.js';
import { env } from '../config/env.js';


const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET;

const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

if (!razorpay) {
  logger.warn('⚠️ [PaymentWorkflow] Razorpay credentials missing. Payments will not function.');
}

export class PaymentWorkflow {
  static async createOrder(
    // eslint-disable-line @typescript-eslint/no-explicit-any
    items: any[],
    receipt: string,
    shippingFee: number = 0,
    discountAmount: number = 0
  ) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Payment order must include at least one item', 400);
    }

    const normalizedItems = items.map((item: any) => ({
      // eslint-disable-line @typescript-eslint/no-explicit-any
      productId: item.productId || item.product_id,
      quantity: Number(item.quantity),
    }));

    for (const item of normalizedItems) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new AppError('Invalid payment item', 400);
      }
    }

    const admin = await getAdminClient();
    const productIds = [...new Set(normalizedItems.map((item: any) => item.productId))];
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: products, error } = await admin
      // eslint-disable-line @typescript-eslint/no-explicit-any
      .from('products')
      .select('id, price, status')
      // eslint-disable-line @typescript-eslint/no-explicit-any
      .in('id', productIds);

    if (error) throw error;

    const productById = new Map<string, any>(
      // eslint-disable-line @typescript-eslint/no-explicit-any
      (products || []).map((product: any) => [product.id, product])
      // eslint-disable-line @typescript-eslint/no-explicit-any
    );
    const subtotal = normalizedItems.reduce((sum: number, item: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      const product = productById.get(item.productId);
      if (!product || product.status !== 'active') {
        throw new AppError(`Product ${item.productId} is not available`, 400);
      }
      return sum + Number(product.price) * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const finalTotal = Math.max(0, subtotal + tax + shippingFee - discountAmount);
    const amount = Math.round(finalTotal * 100); // Razorpay expects amount in paise

    if (!razorpay) {
      throw new AppError('Payment system is not configured', 500);
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
    });

    return {
      provider: 'razorpay',
      key: env.RAZORPAY_KEY_ID,
      order,
    };
  }

  static verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  }
}
