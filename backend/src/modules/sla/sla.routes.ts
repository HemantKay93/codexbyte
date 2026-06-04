import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';

import { SlaController } from './sla.controller.js';

export const slaRoutes = Router();
const controller = new SlaController();

slaRoutes.use(authenticate);

slaRoutes.get('/policies', (req, res) => controller.getPolicies(req, res));
slaRoutes.post('/policies', (req, res) => controller.createPolicy(req, res));

slaRoutes.get('/breaches', (req, res) => controller.getBreaches(req, res));
slaRoutes.put('/breaches/:id/acknowledge', (req, res) => controller.acknowledgeBreach(req, res));
