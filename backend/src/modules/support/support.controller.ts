import { Request, Response } from 'express';
import { SupportRepository } from './support.repository.js';
import { catchAsync } from '../../middlewares/error.js';
import { AuthRequest } from '../../middlewares/auth.js';

const supportRepo = new SupportRepository();

export const getMyTickets = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await supportRepo.findByUserId(req.user.id);
  res.json({
    success: true,
    data,
  });
});

export const getAllTickets = catchAsync(async (req: Request, res: Response) => {
  const data = await supportRepo.findAll();
  res.json({
    success: true,
    message: 'Tickets retrieved successfully',
    data,
  });
});

export const getTicket = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await supportRepo.findById(id);
  res.json({
    success: true,
    message: 'Ticket retrieved successfully',
    data,
  });
});

export const createTicket = catchAsync(async (req: Request, res: Response) => {
  const data = await supportRepo.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Ticket created successfully',
    data,
  });
});

export const updateTicket = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await supportRepo.update(id, req.body);
  res.json({
    success: true,
    message: 'Ticket updated successfully',
    data,
  });
});
