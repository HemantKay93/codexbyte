import express from 'express';

import { authenticate } from '../../middlewares/auth.js';

import * as reportingController from './reporting.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/sales', reportingController.getSalesDashboard);
router.get('/financials', reportingController.getFinancialDashboard);
router.get('/inventory', reportingController.getInventoryReport);
router.get('/crm', reportingController.getCrmReport);

export default router;
