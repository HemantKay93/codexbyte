import { apiClient } from '../apiClient';

export const MarketingService = {
  submitLead: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => {
    const response = await apiClient.post('/leads', data);
    return response.data;
  },

  getCoupons: async () => {
    const response = await apiClient.get('/marketing/coupons');
    return response.data;
  },

  createCoupon: async (data: any) => {
    const response = await apiClient.post('/marketing/coupons', data);
    return response.data;
  },
};
