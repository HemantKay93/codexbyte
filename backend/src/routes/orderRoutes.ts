import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Customer routes
router.get('/me', authenticate, orderController.getMyOrders);
router.get('/:id/items', authenticate, orderController.getOrderItems);
router.post('/', authenticate, orderController.createOrder);

// Admin routes
router.get('/admin', authenticate, authorize('admin', 'super-admin'), orderController.getAllOrders);
router.get(
  '/admin/:id',
  authenticate,
  authorize('admin', 'super-admin'),
  orderController.getOrderById
);
router.put(
  '/admin/:id',
  authenticate,
  authorize('admin', 'super-admin'),
  orderController.updateOrder
);

// Legacy routes support
router.get('/', authenticate, orderController.getMyOrders);

export default router;
