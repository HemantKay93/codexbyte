import express from 'express';

import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

import * as marketingController from './marketing.controller.js';
import * as campaignController from './campaign.controller.js';
import segmentRouter from './segment.routes.js';
import templateRouter from './template.routes.js';
import automationRouter from './automation.routes.js';
import {
  createCouponSchema,
  validateCouponSchema,
  createCampaignSchema,
} from './marketing.validator.js';

const router = express.Router();

// Public / Customer routes
router.post(
  '/validate-coupon',
  authenticate,
  validate(validateCouponSchema),
  marketingController.validateCoupon
);

// Admin routes
router.use(authenticate, authorize('admin', 'super-admin'));
router.get('/coupons', marketingController.getCoupons);
router.post('/coupons', validate(createCouponSchema), marketingController.createCoupon);

// Campaigns
router.get('/campaigns', campaignController.getCampaigns);
router.post('/campaigns', validate(createCampaignSchema), campaignController.createCampaign);
router.post('/campaigns/:id/enqueue', campaignController.enqueueCampaign);

// CRM Modules
router.use('/segments', segmentRouter);
router.use('/templates', templateRouter);
router.use('/automations', automationRouter);

export default router;
