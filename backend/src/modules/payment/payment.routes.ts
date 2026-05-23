import express from 'express';
import * as paymentController from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { idempotencyMiddleware } from '../../middlewares/idempotency.middleware.js';

const router = express.Router();

router.post('/razorpay/order', idempotencyMiddleware, paymentController.createRazorpayOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);

export default router;
