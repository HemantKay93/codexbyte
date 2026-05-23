import { Request, Response } from 'express';
import { AutomationService } from './automation.service.js';
import { catchAsync } from '../../middlewares/error.js';

const automationService = new AutomationService();

export const getFlows = catchAsync(async (req: Request, res: Response) => {
  const flows = await automationService.getFlows();
  res.json({ success: true, data: flows });
});

export const createFlow = catchAsync(async (req: Request, res: Response) => {
  const flow = await automationService.createFlow(req.body);
  res.status(201).json({ success: true, data: flow });
});
