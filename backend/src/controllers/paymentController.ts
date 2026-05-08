import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/error.js';
import { AppError } from '../middlewares/error.js';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { getAdminClient } from '../config/supabase.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const createRazorpayOrder = catchAsync(async (req: Request, res: Response) => {
  const { items, receipt } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Payment order must include at least one item', 400);
  }

  const normalizedItems = items.map((item: any) => ({
    productId: item.productId || item.product_id,
    quantity: Number(item.quantity),
  }));

  for (const item of normalizedItems) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new AppError('Invalid payment item', 400);
    }
  }

  const admin = await getAdminClient();
  const productIds = [...new Set(normalizedItems.map((item: any) => item.productId))];
  const { data: products, error } = await admin
    .from('products')
    .select('id, price, status')
    .in('id', productIds);

  if (error) throw error;

  const productById = new Map<string, any>(
    (products || []).map((product: any) => [product.id, product])
  );
  const subtotal = normalizedItems.reduce((sum: number, item: any) => {
    const product = productById.get(item.productId);
    if (!product || product.status !== 'active') {
      throw new AppError(`Product ${item.productId} is not available`, 400);
    }
    return sum + Number(product.price) * item.quantity;
  }, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const amount = Math.round((subtotal + tax) * 100);

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt,
  });

  res.json({
    provider: 'razorpay',
    key: process.env.RAZORPAY_KEY_ID,
    order,
  });
});

export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  res.json({ verified: expectedSignature === razorpay_signature });
});
