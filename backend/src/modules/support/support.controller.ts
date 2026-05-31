import { Request, Response } from 'express';

import { catchAsync, AppError } from '../../middlewares/error.js';
import { AuthRequest } from '../../middlewares/auth.js';

import { SupportRepository } from './support.repository.js';

const supportRepo = new SupportRepository();

export const getMyTickets = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Unauthorized', 401);
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
  const data = await supportRepo.findById(id as string);
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
  const data = await supportRepo.update(id as string, req.body);
  res.json({
    success: true,
    message: 'Ticket updated successfully',
    data,
  });
});

import { SupportService } from './support.service.js';

export const replyTicket = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { messageBody } = req.body;
  
  if (!req.user) throw new AppError('Unauthorized', 401);
  const senderName = req.user.full_name || req.user.email || 'Agent';
  const senderEmail = req.user.email || '';

  const message = await SupportService.replyToTicket(id as string, messageBody, senderName, senderEmail);
  
  res.status(201).json({
    success: true,
    message: 'Reply sent successfully',
    data: message,
  });
});
