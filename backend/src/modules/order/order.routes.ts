import express from 'express';
import rateLimit from 'express-rate-limit';

import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { requirePermission } from '../../middlewares/permission.js';
import { idempotencyMiddleware } from '../../middlewares/idempotency.middleware.js';

import { createOrderSchema } from './order.validator.js';
import * as orderController from './order.controller.js';

const orderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 orders per windowMs
  message: { message: 'Too many order creation attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

// Customer routes
router.get('/me', authenticate, orderController.getMyOrders);
router.get('/:id/items', authenticate, orderController.getOrderItems);
router.post(
  '/',
  authenticate,
  orderRateLimiter,
  validate(createOrderSchema),
  idempotencyMiddleware,
  orderController.createOrder
);

// Admin routes
router.get('/admin', authenticate, requirePermission('orders:read'), orderController.getAllOrders);
router.get(
  '/admin/:id',
  authenticate,
  requirePermission('orders:read'),
  orderController.getOrderById
);
router.put(
  '/admin/:id',
  authenticate,
  requirePermission('orders:write'),
  orderController.updateOrder
);

// Legacy routes support
router.get('/', authenticate, orderController.getMyOrders);

export default router;
