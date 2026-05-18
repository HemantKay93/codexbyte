import express from 'express';
import * as cmsController from './cms.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/:pageSlug', cmsController.getCmsContent);
router.put(
  '/admin/:pageSlug',
  authenticate,
  authorize('admin', 'super-admin'),
  cmsController.updatePageContent
);
router.put(
  '/admin/:pageSlug/:sectionKey',
  authenticate,
  authorize('admin', 'super-admin'),
  cmsController.updateCmsContent
);

export default router;
