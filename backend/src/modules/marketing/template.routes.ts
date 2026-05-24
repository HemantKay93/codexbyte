import { Router } from 'express';
import { getEmailTemplates, createEmailTemplate, getPushTemplates, createPushTemplate } from './template.controller.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createTemplateSchema } from './marketing.validator.js';

const router = Router();

router.use(requireAdmin);

router.get('/email', getEmailTemplates);
router.post('/email', validate(createTemplateSchema), createEmailTemplate);
router.get('/push', getPushTemplates);
router.post('/push', validate(createTemplateSchema), createPushTemplate);

export default router;
