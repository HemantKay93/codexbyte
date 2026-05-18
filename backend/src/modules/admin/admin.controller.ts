import { Request, Response } from 'express';
import { AdminService } from './admin.service.js';
import { AdminRepository } from './admin.repository.js';
import { catchAsync } from '../../middlewares/error.js';
import { AnalyticsService } from '../../services/analyticsService.js';
import { getAdminClient } from '../../config/supabase.js';

const adminService = new AdminService();
const adminRepo = new AdminRepository();

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await AnalyticsService.getDashboardStats();
  res.json({
    success: true,
    data: stats,
  });
});

export const getCustomers = catchAsync(async (req: Request, res: Response) => {
  const customers = await adminService.getCustomers();
  res.json({
    success: true,
    data: customers,
  });
});

export const getCustomerDetail = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const detail = await adminService.getCustomerDetail(id as string);
  res.json({
    success: true,
    data: detail,
  });
});

export const getSalesReport = catchAsync(async (req: Request, res: Response) => {
  const daysQuery = req.query.days;
  const days = typeof daysQuery === 'string' ? parseInt(daysQuery) : 7;
  const report = await AnalyticsService.getSalesTrend(days);

  res.json({
    success: true,
    data: report,
  });
});

export const getWarehouseTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await adminService.getWarehouseTasks();
  res.json({
    success: true,
    data: tasks,
  });
});
export const getOrderActivity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await adminService.getOrderActivity(id);
  res.json({
    success: true,
    data,
  });
});

export const createWarehouse = catchAsync(async (req: Request, res: Response) => {
  const data = await adminService.createWarehouse(req.body);
  res.status(201).json({
    success: true,
    data,
  });
});

export const updateWarehouse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await adminService.updateWarehouse(id, req.body);
  res.json({
    success: true,
    data,
  });
});

export const getWarehouses = catchAsync(async (req: Request, res: Response) => {
  const data = await adminService.getWarehouses();
  res.json({
    success: true,
    data,
  });
});

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const data = await adminService.getNotifications();
  res.json({
    success: true,
    data,
  });
});

export const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await adminService.markNotificationRead(id);
  res.json({
    success: true,
    data,
  });
});

export const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, module, action, userId } = req.query;
  const data = await AdminService.getAuditLogs({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    module: module as string,
    action: action as string,
    userId: userId as string,
  });
  res.json({
    success: true,
    data,
  });
});

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  // Placeholder: In a real system, this would upload to S3/Cloudinary/Supabase
  res.json({
    success: true,
    data: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  });
});

