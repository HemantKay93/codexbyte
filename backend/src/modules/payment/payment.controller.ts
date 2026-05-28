import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';
import { AppError } from '../../middlewares/error.js';
import { PaymentWorkflow } from '../../workflows/paymentWorkflow.service.js';

export const createRazorpayOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentWorkflow.createOrder(req.body.items, req.body.receipt);
  res.json(result);
});

export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const verified = PaymentWorkflow.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  res.json({ verified });
});
