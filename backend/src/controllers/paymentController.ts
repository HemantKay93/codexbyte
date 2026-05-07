import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/error.js';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const createRazorpayOrder = catchAsync(async (req: Request, res: Response) => {
  const { amount, receipt } = req.body;
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
