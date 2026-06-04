import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';

import { OperationsController } from './operations.controller.js';

export const operationsRoutes = Router();
const controller = new OperationsController();

operationsRoutes.use(authenticate);

operationsRoutes.get('/health', (req, res) => controller.getHealth(req, res));
