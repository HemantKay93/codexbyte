import { Router } from 'express';
import { createLead, getLeads } from '../controllers/leadController.js';
import { leadSchema } from '../validators/leadValidator.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/', validate(leadSchema), createLead);
router.get('/', authenticate, authorize('admin', 'super-admin'), getLeads);

export default router;
