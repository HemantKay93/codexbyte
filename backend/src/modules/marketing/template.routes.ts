import { Router } from 'express';

import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  getPushTemplates,
  createPushTemplate,
  updatePushTemplate,
} from './template.controller.js';
import { createEmailTemplateSchema, createPushTemplateSchema } from './marketing.validator.js';

const router = Router();

router.use(requireAdmin);

router.get('/email', getEmailTemplates);
router.post('/email', validate(createEmailTemplateSchema), createEmailTemplate);
router.put('/email/:id', validate(createEmailTemplateSchema), updateEmailTemplate);
router.get('/push', getPushTemplates);
router.post('/push', validate(createPushTemplateSchema), createPushTemplate);
router.put('/push/:id', validate(createPushTemplateSchema), updatePushTemplate);

export default router;
