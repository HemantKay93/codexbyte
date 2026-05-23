import { Router } from 'express';
import { getEmailTemplates, createEmailTemplate, getPushTemplates, createPushTemplate } from './template.controller.js';
import { requireAdmin } from '../../middlewares/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/email', getEmailTemplates);
router.post('/email', createEmailTemplate);
router.get('/push', getPushTemplates);
router.post('/push', createPushTemplate);

export default router;
