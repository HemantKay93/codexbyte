import { Request, Response } from 'express';
import { AdminService } from '../services/adminService.js';
import { AdminRepository } from '../repositories/adminRepository.js';
import { catchAsync } from '../middlewares/error.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { getAdminClient } from '../config/supabase.js';

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
  const daysQuery = req.query.days;
  const days = typeof daysQuery === 'string' ? parseInt(daysQuery) : 7;
  const report = await AnalyticsService.getSalesTrend(days);

  res.json(report);
});

export const getWarehouseTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await adminService.getWarehouseTasks();
  res.json(tasks);
});
export const getOrderActivity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('order_activity_logs')
    .select('*, user_profiles(full_name)')
    .eq('order_id', id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

export const createWarehouse = catchAsync(async (req: Request, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin.from('warehouses').insert(req.body).select().single();

  if (error) throw error;
  res.json(data);
});

export const updateWarehouse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('warehouses')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

export const getWarehouses = catchAsync(async (req: Request, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});
