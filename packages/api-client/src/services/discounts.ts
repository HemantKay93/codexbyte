import { apiClient } from '../apiClient';

export interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  expiry_date?: string;
}

export const DiscountService = {
  getDiscounts: async () => {
    const response = await apiClient.get('/discounts');
    return response.data;
  },

  applyDiscount: async (code: string, cartTotal: number) => {
    const response = await apiClient.post('/discounts/apply', { code, cartTotal });
    return response.data;
  }
};
