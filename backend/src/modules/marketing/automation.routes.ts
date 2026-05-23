import { Router } from 'express';
import { getFlows, createFlow } from './automation.controller.js';
import { requireAdmin } from '../../middlewares/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', getFlows);
router.post('/', createFlow);

export default router;
