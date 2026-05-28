import { Router } from 'express';

import { authenticate, requireAdmin } from '../../middlewares/auth.js';

import * as accountingController from './accounting.controller.js';

const router = Router();

// Protect all accounting routes
router.use(authenticate);
router.use(requireAdmin);

router.post('/invoices', accountingController.createInvoice);
router.get('/invoices', accountingController.getInvoices);
router.get('/invoices/:id', accountingController.getInvoiceById);

router.post('/journal', accountingController.createJournalEntry);
router.get('/journal', accountingController.getJournalEntries);

router.get('/profit-loss', accountingController.getProfitLoss);
router.get('/gst-report', accountingController.getGSTReport);

export const accountingRoutes = router;
