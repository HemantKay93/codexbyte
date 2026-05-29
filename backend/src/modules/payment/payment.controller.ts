import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';
import { AppError } from '../../middlewares/error.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars
import { PaymentWorkflow } from '../../workflows/paymentWorkflow.service.js';

export const createRazorpayOrder = catchAsync(async (req: Request, res: Response) => {
  const { items, receipt, shippingFee, discountAmount } = req.body;
  const result = await PaymentWorkflow.createOrder(
    items,
    receipt,
    shippingFee || 0,
    discountAmount || 0
  );
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
