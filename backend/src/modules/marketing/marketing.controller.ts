import { Response } from 'express';

import { AuthRequest } from '../../middlewares/auth.js';
import { catchAsync } from '../../middlewares/error.js';
import { AuditService } from '../../services/auditService.js';
import { createResponse } from '../../utils/apiResponse.js';

import { MarketingService } from './marketing.service.js';

const marketingService = new MarketingService();

export const validateCoupon = catchAsync(async (req: AuthRequest, res: Response) => {
  const { code, orderAmount } = req.body;
  const userId = req.user?.id;

  const result = await marketingService.validateCoupon(code, userId, orderAmount);
  res.json(createResponse(result, 'Coupon applied successfully'));
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

  res.status(201).json(createResponse(coupon, 'Coupon created successfully'));
});

export const getCoupons = catchAsync(async (req: AuthRequest, res: Response) => {
  const coupons = await marketingService.getCoupons();
  res.json(createResponse(coupons, 'Coupons fetched successfully'));
});
