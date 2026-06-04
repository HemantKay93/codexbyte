import { Router } from 'express';
import { CrmController } from './crm.controller.js';
import { authenticate } from '../../middlewares/auth.js';

export const crmRoutes = Router();
const crmController = new CrmController();

crmRoutes.use(authenticate);

// Customer 360
crmRoutes.get('/customer-360/:id', (req, res) => crmController.getCustomer360(req, res));

// Pipelines & Stages
crmRoutes.get('/pipelines', (req, res) => crmController.getPipelines(req, res));
crmRoutes.get('/pipelines/:pipelineId/board', (req, res) => crmController.getBoardData(req, res));

// Deals
crmRoutes.get('/deals', (req, res) => crmController.getDeals(req, res));
crmRoutes.post('/deals', (req, res) => crmController.createDeal(req, res));
crmRoutes.put('/deals/:id/stage', (req, res) => crmController.moveDeal(req, res));

// Activities
crmRoutes.get('/deals/:id/activities', (req, res) => crmController.getDealActivities(req, res));
crmRoutes.post('/deals/:id/activities', (req, res) => crmController.createActivity(req, res));
