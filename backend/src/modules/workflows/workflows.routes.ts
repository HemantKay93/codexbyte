import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';

import { WorkflowsController } from './workflows.controller.js';

export const workflowsRoutes = Router();
const controller = new WorkflowsController();

workflowsRoutes.use(authenticate);

workflowsRoutes.get('/', (req, res) => controller.getWorkflows(req, res));
workflowsRoutes.post('/', (req, res) => controller.createWorkflow(req, res));
workflowsRoutes.put('/:id', (req, res) => controller.updateWorkflow(req, res));
workflowsRoutes.get('/executions', (req, res) => controller.getExecutions(req, res));
