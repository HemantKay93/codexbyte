import { getAdminClient } from '../../config/supabase.js';
import { AppError } from '../../middlewares/error.js';

export class MarketingRepository {
  async findCouponByCode(code: string) {
    const admin = await getAdminClient();
    const { data: coupon, error } = await admin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      throw new AppError('Invalid or inactive coupon code', 400);
    }
    return coupon;
  }

  async checkCouponUsage(couponId: string, userId: string) {
    const admin = await getAdminClient();
    const { data: previousUsage } = await admin
      .from('coupon_usage')
      .select('id')
      .eq('coupon_id', couponId)
      .eq('user_id', userId)
      .maybeSingle();

    return previousUsage;
  }

  async recordCouponUsage(
    couponId: string,
    userId: string,
    orderId: string,
    discountApplied: number
  ) {
    const admin = await getAdminClient();

    // 1. Insert Usage record
    await admin.from('coupon_usage').insert({
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId,
      discount_applied: discountApplied,
    });

    // 2. Increment Usage Count
    const { error: updateError } = await admin.rpc('increment_coupon_usage', {
      coupon_id: couponId,
    });

    if (updateError) {
      const { data: coupon } = await admin
        .from('coupons')
        .select('usage_count')
        .eq('id', couponId)
        .single();
      if (coupon) {
        await admin
          .from('coupons')
          .update({ usage_count: coupon.usage_count + 1 })
          .eq('id', couponId);
        // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
  }

  async createCoupon(data: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { data: coupon, error } = await admin
      .from('coupons')
      .insert({ ...data, code: data.code.toUpperCase() })
      .select()
      .single();
    if (error) throw new AppError('Failed to create coupon', 500);
    return coupon;
  }

  async findAllCoupons() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new AppError('Failed to fetch coupons', 500);
    return data;
  }
}
