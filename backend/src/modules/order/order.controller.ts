import { Request, Response } from 'express';
import { OrderService } from './order.service.js';
import { catchAsync } from '../../middlewares/error.js';
import { AuthRequest } from '../../middlewares/auth.js';

const orderService = new OrderService();

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await orderService.getAllOrders(req.query);
  res.json({
    success: true,
    data: orders,
  });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id as string);
  res.json({
    success: true,
    data: order,
  });
});

export const getOrderItems = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const order = await orderService.getOrderByIdForUser(
    req.params.id as string,
    authReq.user.id as string,
    authReq.user.email,
    authReq.user.role
  );
  res.json({
    success: true,
    data: order.order_items || [],
  });
});

export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const orders = await orderService.getMyOrders(req.user.id as string, req.user.email);
  res.json({
    success: true,
    data: orders,
  });
});

export const createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const order = await orderService.createOrder(req.user?.id as string, req.body, req.user?.email);
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

export const updateOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await orderService.updateOrderStatus(
    req.params.id as string,
    req.body,
    req.user?.id as string
  );
  res.json({
    success: true,
    message: 'Order updated successfully',
    data: result,
  });
});

export const processReturn = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await orderService.processReturn(req.params.id as string, {
    ...req.body,
    userId: req.user?.id as string,
  });
  res.json({
    success: true,
    message: 'Return processed successfully',
    data: result,
  });
});
