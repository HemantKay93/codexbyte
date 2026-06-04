import { Router } from 'express';
import { ApprovalsController } from './approvals.controller.js';
import { authenticate } from '../../middlewares/auth.js';

export const approvalsRoutes = Router();
const controller = new ApprovalsController();

approvalsRoutes.use(authenticate);

// Templates
approvalsRoutes.get('/templates', (req, res) => controller.getTemplates(req, res));
approvalsRoutes.post('/templates', (req, res) => controller.createTemplate(req, res));

// Requests / Inbox
approvalsRoutes.get('/requests', (req, res) => controller.getAllRequests(req, res));
approvalsRoutes.get('/inbox', (req, res) => controller.getInbox(req, res));
approvalsRoutes.post('/requests', (req, res) => controller.triggerApproval(req, res));

// Steps
approvalsRoutes.put('/requests/:requestId/steps/:stepId', (req, res) => controller.processStep(req, res));
