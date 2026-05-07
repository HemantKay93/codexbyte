import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { MarketingService } from '../services/marketingService.js';
import { catchAsync } from '../middlewares/error.js';
import { AuditService } from '../services/auditService.js';

const marketingService = new MarketingService();

export const validateCoupon = catchAsync(async (req: AuthRequest, res: Response) => {
  const { code, orderAmount } = req.body;
  const userId = req.user?.id;

  const result = await marketingService.validateCoupon(code, userId, orderAmount);
  res.json(result);
});

export const createCoupon = catchAsync(async (req: AuthRequest, res: Response) => {
  const coupon = await marketingService.createCoupon(req.body);

  await AuditService.log({
    user_id: req.user?.id,
    action: 'CREATE_COUPON',
    module: 'marketing',
    entity_id: coupon.id,
    new_data: coupon,
  });

  res.status(201).json(coupon);
});

export const getCoupons = catchAsync(async (req: AuthRequest, res: Response) => {
  const coupons = await marketingService.getCoupons();
  res.json(coupons);
});
