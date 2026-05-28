import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';

import { SegmentService } from './segment.service.js';

const segmentService = new SegmentService();

export const getSegments = catchAsync(async (req: Request, res: Response) => {
  const segments = await segmentService.getSegments();
  res.json({ success: true, data: segments });
});

export const createSegment = catchAsync(async (req: Request, res: Response) => {
  const segment = await segmentService.createSegment(req.body);
  res.status(201).json({ success: true, data: segment });
});
