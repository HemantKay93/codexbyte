import { AppError } from '../../middlewares/error.js';
import { MarketingRepository } from './marketing.repository.js';

const marketingRepo = new MarketingRepository();

export class MarketingService {
  /**
   * Validate a coupon code for an order
   */
  async validateCoupon(code: string, userId: string, orderAmount: number) {
    const coupon = await marketingRepo.findCouponByCode(code);

    // 1. Check Expiration
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
      throw new AppError('This coupon has expired', 400);
    }

    // 2. Check Usage Limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      throw new AppError('This coupon has reached its usage limit', 400);
    }

    // 3. Check Minimum Order Amount
    if (orderAmount < coupon.min_order_amount) {
      throw new AppError(
        `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon`,
        400
      );
    }

    // 4. Check if user already used it
    if (userId) {
      const previousUsage = await marketingRepo.checkCouponUsage(coupon.id, userId);
      if (previousUsage) {
        throw new AppError('You have already used this coupon', 400);
      }
    }

    // 5. Calculate Discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderAmount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      discount: Math.round(discount),
      finalAmount: Math.max(0, orderAmount - discount),
    };
  }

  /**
   * Record coupon usage after successful order
   */
  async recordUsage(couponId: string, userId: string, orderId: string, discountApplied: number) {
    await marketingRepo.recordCouponUsage(couponId, userId, orderId, discountApplied);
  }

  async createCoupon(data: any) {
    return await marketingRepo.createCoupon(data);
  }

  async getCoupons() {
    return await marketingRepo.findAllCoupons();
  }
}
