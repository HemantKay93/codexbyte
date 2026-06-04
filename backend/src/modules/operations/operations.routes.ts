import { Router } from 'express';
import { OperationsController } from './operations.controller.js';
import { authenticate } from '../../middlewares/auth.js';

export const operationsRoutes = Router();
const controller = new OperationsController();

operationsRoutes.use(authenticate);

operationsRoutes.get('/health', (req, res) => controller.getHealth(req, res));
