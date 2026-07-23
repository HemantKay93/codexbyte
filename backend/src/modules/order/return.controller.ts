import { Response } from 'express';

import { AuthRequest } from '../../middlewares/auth.js';
import { ReturnService } from '../../services/returnService.js';
import { catchAsync } from '../../middlewares/error.js';

const returnService = new ReturnService();

export const createReturnRequest = catchAsync(async (req: AuthRequest, res: Response) => {
  const { orderId, reason, items } = req.body;
  const userId = req.user?.id || '';

  const result = await returnService.createReturnRequest({
    orderId,
    userId,
    reason,
    items,
  });
  res.status(201).json(result);
});

export const getReturns = catchAsync(async (req: AuthRequest, res: Response) => {
  const returns = await returnService.getAllReturns(req.query);
  res.json(returns);
});

export const updateReturnStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { status, notes } = req.body;
  const adminId = req.user?.id;

  const result = await returnService.updateReturnStatus(id, status, notes, adminId);
  res.json(result);
});
