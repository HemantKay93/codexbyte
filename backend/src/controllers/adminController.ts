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
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('order_activity_logs')
    .select('*, user_profiles(full_name)')
    .eq('order_id', id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json({
    success: true,
    data,
  });
});

export const createWarehouse = catchAsync(async (req: Request, res: Response) => {
  const { name, location, address, is_active } = req.body;
  // Merge address and location since 'address' column is missing in schema
  const combinedLocation = address && location ? `${address}, ${location}` : address || location;

  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('warehouses')
    .insert({
      name,
      location: combinedLocation,
      is_active,
    })
    .select()
    .single();

  if (error) {
    console.error(`[Admin] Database error creating warehouse:`, error);
    return res.status(500).json({ success: false, message: `Database error: ${error.message}` });
  }
  res.status(201).json({
    success: true,
    data,
  });
});

export const updateWarehouse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, location, address, is_active } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Warehouse ID is required' });
  }

  // Merge address and location since 'address' column is missing in schema
  const combinedLocation = address && location ? `${address}, ${location}` : address || location;

  console.log(`[Admin] Attempting to update warehouse ${id}:`, {
    name,
    location: combinedLocation,
    is_active,
  });

  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('warehouses')
    .update({
      name,
      location: combinedLocation,
      is_active,
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error(`[Admin] Database error updating warehouse ${id}:`, error);
    return res.status(500).json({ message: `Database error: ${error.message}` });
  }

  if (!data || data.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: 'Warehouse not found or no changes made' });
  }

  res.json({
    success: true,
    data: data[0],
  });
});

export const getWarehouses = catchAsync(async (req: Request, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json({
    success: true,
    data,
  });
});

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  res.json({
    success: true,
    data,
  });
});

export const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  res.json({
    success: true,
    data,
  });
});
