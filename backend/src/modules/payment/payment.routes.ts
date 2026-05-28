import express from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { idempotencyMiddleware } from '../../middlewares/idempotency.middleware.js';

import * as paymentController from './payment.controller.js';

const router = express.Router();

router.post('/razorpay/order', idempotencyMiddleware, paymentController.createRazorpayOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);

export default router;
