import { apiClient } from '../apiClient';

export const AnalyticsService = {
  getAnalytics: async (period?: 'day' | 'week' | 'month' | 'year') => {
    const response = await apiClient.get('/analytics', { params: { period } });
    return response.data;
  },

  getSalesData: async () => {
    const response = await apiClient.get('/analytics/sales');
    return response.data;
  },

  getCustomerMetrics: async () => {
    const response = await apiClient.get('/analytics/customers');
    return response.data;
  }
};
