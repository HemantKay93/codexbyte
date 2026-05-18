import express from 'express';
import * as supportController from './support.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', supportController.getMyTickets);
router.get('/tickets', authorize('admin', 'super-admin'), supportController.getAllTickets);
router.get('/tickets/:id', supportController.getTicket);
router.post('/tickets', supportController.createTicket);
router.put('/tickets/:id', authorize('admin', 'super-admin'), supportController.updateTicket);

export default router;
