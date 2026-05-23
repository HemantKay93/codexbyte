import { Router } from 'express';
import * as controller from './supplier.controller.js';
import { authenticate, requireAdmin } from '../../middlewares/auth.js';

const router = Router();

router.use(authenticate);

// Suppliers
router.get('/', requireAdmin, controller.getSuppliers);
router.post('/', requireAdmin, controller.createSupplier);

// Purchase Orders
router.get('/po', requireAdmin, controller.getPurchaseOrders);
router.post('/po', requireAdmin, controller.createPurchaseOrder);
router.post('/po/:id/receive', requireAdmin, controller.receivePurchaseOrder);

export default router;
