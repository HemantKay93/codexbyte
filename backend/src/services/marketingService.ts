import { getAdminClient } from '../config/supabase.js';
import { AppError } from '../middlewares/error.js';

export class MarketingService {
  /**
   * Validate a coupon code for an order
   */
  async validateCoupon(code: string, userId: string, orderAmount: number) {
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

    // 4. Check if user already used it (optional, depends on policy)
    if (userId) {
      const { data: previousUsage } = await admin
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', userId)
        .maybeSingle();

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
    const admin = await getAdminClient();

    // 1. Insert Usage record
    await admin.from('coupon_usage').insert({
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId,
      discount_applied: discountApplied,
    });

    // 2. Increment Usage Count (Atomic)
    const { error: updateError } = await admin.rpc('increment_coupon_usage', {
      coupon_id: couponId,
    });

    if (updateError) {
      // Fallback if RPC doesn't exist, though RPC is preferred
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
      }
    }
  }

  async createCoupon(data: any) {
    const admin = await getAdminClient();
    const { data: coupon, error } = await admin
      .from('coupons')
      .insert({ ...data, code: data.code.toUpperCase() })
      .select()
      .single();
    if (error) throw error;
    return coupon;
  }

  async getCoupons() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}
