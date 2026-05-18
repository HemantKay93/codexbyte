import express from 'express';
import * as orderController from './order.controller.js';
import { authenticate, authorize, authenticateOptional } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/permission.js';

const router = express.Router();

// Customer routes
router.get('/me', authenticate, orderController.getMyOrders);
router.get('/:id/items', authenticate, orderController.getOrderItems);
router.post('/', authenticateOptional, orderController.createOrder);

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
