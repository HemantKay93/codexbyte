import express from 'express';
import * as posController from './pos.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// All POS routes require auth — staff or admin
router.use(authenticate, authorize('admin', 'super-admin', 'staff'));

// GET  /api/v1/pos/products       — lightweight product list with warehouse stock overlay
router.get('/products', posController.getPosProducts);

// POST /api/v1/pos/checkout       — atomic checkout: validate stock → create order → deduct inventory
router.post('/checkout', posController.posCheckout);

export default router;
