import { Request, Response } from 'express';
import { LeadService } from '../services/leadService.js';
import { catchAsync } from '../middlewares/error.js';

const leadService = new LeadService();

export const createLead = catchAsync(async (req: Request, res: Response) => {
  const data = await leadService.createLead(req.body);
  res.status(201).json({
    success: true,
    message: 'Inquiry sent successfully!',
    data,
  });
});

export const getLeads = catchAsync(async (req: Request, res: Response) => {
  const data = await leadService.getAllLeads();
  res.json({
    success: true,
    data,
  });
});
