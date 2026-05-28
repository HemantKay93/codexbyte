import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';

import { DLQService } from './dlq.service.js';

const dlqService = new DLQService();

export const getDeadLetters = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await dlqService.getDeadLetters(page, limit);
  res.json({ success: true, ...result });
});

export const retryDeadLetter = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await dlqService.retryJob(id);
  res.json(result);
});

export const resolveDeadLetter = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await dlqService.resolveJob(id);
  res.json(result);
});
