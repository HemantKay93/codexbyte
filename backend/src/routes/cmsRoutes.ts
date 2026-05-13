import express from 'express';
import * as cmsController from '../controllers/cmsController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

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
