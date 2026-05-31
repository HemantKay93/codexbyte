import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';
import { AnalyticsService } from '../../services/analyticsService.js';
import { getAdminClient } from '../../config/supabase.js';
import { ProviderService } from '../marketing/providers/provider.service.js';
import { redis } from '../../config/redis.js';

// eslint-disable-line import/order
import { AdminRepository } from './admin.repository.js';
// eslint-disable-line import/order
import { AdminService } from './admin.service.js';
// eslint-disable-line import/order

const adminService = new AdminService();
const adminRepo = new AdminRepository();
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await AnalyticsService.getDashboardStats();
  res.json({
    success: true,
    data: stats,
  });
});

export const getRevenueChart = catchAsync(async (req: Request, res: Response) => {
  const months = Number(req.query.months) || 6;
  const data = await AnalyticsService.getRevenueChart(months);
  res.json({ success: true, data });
});

export const getIntegrationHealth = catchAsync(async (req: Request, res: Response) => {
  const health = {
    database: { status: 'unknown', details: '' },
    redis: { status: 'unknown', details: '' },
    email: { status: 'unknown', details: '' },
    whatsapp: { status: 'unknown', details: '' },
  };

  // Database
  try {
    const adminClient = await getAdminClient();
    const { error } = await adminClient.from('user_profiles').select('id').limit(1);
    health.database = error
      ? { status: 'error', details: error.message }
      : { status: 'connected', details: 'Connected to Supabase' };
    // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    health.database = { status: 'error', details: e.message };
  }

  // Redis
  try {
    const ping = await redis.ping();
    health.redis =
      ping === 'PONG'
        ? { status: 'connected', details: 'Connected to Redis' }
        : // eslint-disable-line @typescript-eslint/no-explicit-any
          { status: 'error', details: 'No PONG response' };
  } catch (e: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    health.redis = { status: 'error', details: e.message };
  }

  // Email
  try {
    const emailProvider = await ProviderService.getEmailProvider();
    const isHealthy = await emailProvider.isHealthy();
    health.email = isHealthy
      ? // eslint-disable-line @typescript-eslint/no-explicit-any
        { status: 'connected', details: `Provider: ${emailProvider.name}` }
      : { status: 'error', details: 'Health check failed' };
  } catch (e: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    health.email = { status: 'error', details: e.message };
  }

  // WhatsApp
  try {
    const waProvider = await ProviderService.getWhatsAppProvider();
    const isHealthy = await waProvider.isHealthy();
    // eslint-disable-line @typescript-eslint/no-explicit-any
    health.whatsapp = isHealthy
      ? { status: 'connected', details: `Provider: ${waProvider.name}` }
      : { status: 'error', details: 'Health check failed' };
  } catch (e: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    health.whatsapp = { status: 'error', details: e.message };
  }

  res.json({ success: true, data: health });
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
  const data = await adminService.getOrderActivity(id as string);
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
  const data = await adminService.updateWarehouse(id as string, req.body);
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
  const data = await adminService.markNotificationRead(id as string);
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

// Team Management
export const getTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('user_profiles')
    .select('*')
    .in('role', ['admin', 'super-admin', 'manager', 'support', 'warehouse-staff'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.json({
    success: true,
    data,
  });
});

export const inviteTeamMember = catchAsync(async (req: Request, res: Response) => {
  const { email, full_name, role } = req.body;
  const admin = await getAdminClient();

  // Create user via Supabase Auth Admin
  const { data: user, error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
  });

  if (authError) throw authError;

  res.json({
    success: true,
    data: user,
  });
});

export const updateTeamMemberRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const admin = await getAdminClient();

  const { data, error } = await admin
    .from('user_profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Also update auth user metadata
  await admin.auth.admin.updateUserById(id, {
    user_metadata: { role },
  });

  res.json({
    success: true,
    data,
  });
});
