import express from 'express';
import * as marketingController from './marketing.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Public / Customer routes
router.post('/validate-coupon', authenticate, marketingController.validateCoupon);

// Admin routes
router.use(authenticate, authorize('admin', 'super-admin'));
router.get('/coupons', marketingController.getCoupons);
router.post('/coupons', marketingController.createCoupon);

export default router;
