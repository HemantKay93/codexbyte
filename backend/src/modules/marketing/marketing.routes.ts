import express from 'express';
import * as marketingController from './marketing.controller.js';
import * as campaignController from './campaign.controller.js';
import segmentRouter from './segment.routes.js';
import templateRouter from './template.routes.js';
import automationRouter from './automation.routes.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Public / Customer routes
router.post('/validate-coupon', authenticate, marketingController.validateCoupon);

// Admin routes
router.use(authenticate, authorize('admin', 'super-admin'));
router.get('/coupons', marketingController.getCoupons);
router.post('/coupons', marketingController.createCoupon);

// Campaigns
router.get('/campaigns', campaignController.getCampaigns);
router.post('/campaigns', campaignController.createCampaign);
router.post('/campaigns/:id/enqueue', campaignController.enqueueCampaign);

// CRM Modules
router.use('/segments', segmentRouter);
router.use('/templates', templateRouter);
router.use('/automations', automationRouter);

export default router;
