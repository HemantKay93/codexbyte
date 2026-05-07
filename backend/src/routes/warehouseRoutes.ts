import express from 'express';
import * as warehouseController from '../controllers/warehouseController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { auditLog } from '../middlewares/audit.js';
import { warehouseSchema, stockAdjustmentSchema } from '../validators/warehouseValidator.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'super-admin', 'staff'));

router.get('/', warehouseController.getAllWarehouses);
router.post(
  '/',
  authorize('admin', 'super-admin'),
  validate(warehouseSchema),
  auditLog('warehouse', 'CREATE_WAREHOUSE'),
  warehouseController.createWarehouse
);

router.get('/:id/inventory', warehouseController.getWarehouseInventory);
router.post(
  '/adjust-stock',
  validate(stockAdjustmentSchema),
  auditLog('inventory', 'ADJUST_STOCK'),
  warehouseController.adjustStock
);

export default router;
