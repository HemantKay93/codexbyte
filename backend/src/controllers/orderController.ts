import { Request, Response } from 'express';
import { OrderService } from '../services/orderService.js';
import { catchAsync } from '../middlewares/error.js';
import { AuthRequest } from '../middlewares/auth.js';

const orderService = new OrderService();

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await orderService.getAllOrders(req.query);
  res.json(orders);
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
});

export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const orders = await orderService.getMyOrders(req.user.id);
  res.json(orders);
});

export const createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const order = await orderService.createOrder(req.user?.id, req.body);
  res.status(201).json(order);
});

export const updateOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await orderService.updateOrderStatus(req.params.id, req.body, req.user?.id);
  res.json(result);
});
