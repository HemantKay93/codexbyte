import { Router } from 'express';

import { authenticate, requireAdmin } from '../../middlewares/auth.js';

import * as controller from './supplier.controller.js';

const router = Router();

router.use(authenticate);

// Suppliers
router.get('/', requireAdmin, controller.getSuppliers);
router.post('/', requireAdmin, controller.createSupplier);

// Purchase Orders
router.get('/po', requireAdmin, controller.getPurchaseOrders);
router.post('/po', requireAdmin, controller.createPurchaseOrder);
router.post('/po/:id/receive', requireAdmin, controller.receivePurchaseOrder);

// Single Supplier (Must be after /po to prevent greedy matching)
router.get('/:id', requireAdmin, controller.getSupplierById);

export default router;
