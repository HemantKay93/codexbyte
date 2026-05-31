import express from 'express';

import { authenticate, authorize } from '../../middlewares/auth.js';

import * as supportController from './support.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', supportController.getMyTickets);
router.get('/tickets', authorize('admin', 'super-admin', 'support-agent'), supportController.getAllTickets);
router.get('/tickets/:id', supportController.getTicket);
router.post('/tickets', supportController.createTicket);
router.put('/tickets/:id', authorize('admin', 'super-admin', 'support-agent'), supportController.updateTicket);
router.post('/tickets/:id/reply', authorize('admin', 'super-admin', 'support-agent'), supportController.replyTicket);

export default router;
