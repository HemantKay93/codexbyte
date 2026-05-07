import { Request, Response } from 'express';
import { AdminService } from '../services/adminService.js';
import { AdminRepository } from '../repositories/adminRepository.js';
import { catchAsync } from '../middlewares/error.js';

const adminService = new AdminService();
const adminRepo = new AdminRepository();

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardData();
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
  const report = await adminService.getSalesReport();
  res.json(report);
});

export const getWarehouseTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await adminService.getWarehouseTasks();
  res.json(tasks);
});
