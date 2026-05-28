import { Router } from 'express';

import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

import {
  getEmailTemplates,
  createEmailTemplate,
  getPushTemplates,
  createPushTemplate,
} from './template.controller.js';
import { createTemplateSchema } from './marketing.validator.js';

const router = Router();

router.use(requireAdmin);

router.get('/email', getEmailTemplates);
router.post('/email', validate(createTemplateSchema), createEmailTemplate);
router.get('/push', getPushTemplates);
router.post('/push', validate(createTemplateSchema), createPushTemplate);

export default router;
