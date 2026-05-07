import { Request, Response } from 'express';
import { AdminService } from '../services/adminService.js';
import { AdminRepository } from '../repositories/adminRepository.js';
import { catchAsync } from '../middlewares/error.js';
import { AnalyticsService } from '../services/analyticsService.js';

const adminService = new AdminService();
const adminRepo = new AdminRepository();

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await AnalyticsService.getDashboardStats();
  res.json(stats);
});

export const getCustomers = catchAsync(async (req: Request, res: Response) => {
  const customers = await adminService.getCustomers();
  res.json(customers);
});

export const getCustomerDetail = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const detail = await adminService.getCustomerDetail(id);
  res.json(detail);
});

export const getSalesReport = catchAsync(async (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string) : 7;
  const report = await AnalyticsService.getSalesTrend(days);
  res.json(report);
});

export const getWarehouseTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await adminService.getWarehouseTasks();
  res.json(tasks);
});
