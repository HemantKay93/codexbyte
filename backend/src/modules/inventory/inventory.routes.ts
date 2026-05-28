import express from 'express';

import { authenticate, authorize } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validate.js';
import { auditLog } from '../../middlewares/audit.js';

import * as warehouseController from './inventory.controller.js';
import {
  warehouseSchema,
  stockAdjustmentSchema,
  stockTransferSchema,
} from './inventory.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission('inventory:read'), warehouseController.getAllWarehouses);
router.post(
  '/',
  requirePermission('inventory:write'),
  validate(warehouseSchema),
  auditLog('warehouse', 'CREATE_WAREHOUSE'),
  warehouseController.createWarehouse
);

router.get(
  '/:id/inventory',
  requirePermission('inventory:read'),
  warehouseController.getWarehouseInventory
);
router.post(
  '/adjust-stock',
  requirePermission('inventory:write'),
  validate(stockAdjustmentSchema),
  auditLog('inventory', 'ADJUST_STOCK'),
  warehouseController.adjustStock
);

router.post(
  '/transfer-stock',
  requirePermission('inventory:write'),
  validate(stockTransferSchema),
  auditLog('inventory', 'TRANSFER_STOCK'),
  warehouseController.transferStock
);

export default router;
