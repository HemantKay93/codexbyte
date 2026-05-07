import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { MarketingService } from '../services/marketingService.js';
import { catchAsync } from '../middlewares/error.js';

const marketingService = new MarketingService();

export const validateCoupon = catchAsync(async (req: AuthRequest, res: Response) => {
  const { code, orderAmount } = req.body;
  const userId = req.user?.id;

  const result = await marketingService.validateCoupon(code, userId, orderAmount);
  res.json(result);
});

export const createCoupon = catchAsync(async (req: AuthRequest, res: Response) => {
  const coupon = await marketingService.createCoupon(req.body);
  res.status(201).json(coupon);
});

export const getCoupons = catchAsync(async (req: AuthRequest, res: Response) => {
  const { getAdminClient } = await import('../config/supabase.js');
  const admin = await getAdminClient();
  const { data, error } = await admin.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
});
