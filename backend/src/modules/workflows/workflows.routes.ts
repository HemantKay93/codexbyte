import { Router } from 'express';
import { WorkflowsController } from './workflows.controller.js';
import { authenticate } from '../../middlewares/auth.js';

export const workflowsRoutes = Router();
const controller = new WorkflowsController();

workflowsRoutes.use(authenticate);

workflowsRoutes.get('/', (req, res) => controller.getWorkflows(req, res));
workflowsRoutes.post('/', (req, res) => controller.createWorkflow(req, res));
workflowsRoutes.put('/:id', (req, res) => controller.updateWorkflow(req, res));
workflowsRoutes.get('/executions', (req, res) => controller.getExecutions(req, res));
