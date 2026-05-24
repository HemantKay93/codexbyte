import { Router } from 'express';
import { getFlows, createFlow } from './automation.controller.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createAutomationFlowSchema } from './marketing.validator.js';

const router = Router();

router.use(requireAdmin);

router.get('/', getFlows);
router.post('/', validate(createAutomationFlowSchema), createFlow);

export default router;
