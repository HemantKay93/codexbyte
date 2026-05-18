import express from 'express';
import * as paymentController from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/razorpay/order', paymentController.createRazorpayOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);

export default router;
