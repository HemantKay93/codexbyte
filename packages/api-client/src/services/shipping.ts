import { apiClient } from '../apiClient';

export const ShippingService = {
  createShiprocketShipment: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post('/shipping/shiprocket', payload);
    return response.data;
  },

  getTrackingById: async (trackingId: string) => {
    const response = await apiClient.get(`/tracking/${trackingId}`);
    return response.data;
  },

  calculateShippingRates: async (params: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get('/shipping/rates', { params });
    return response.data;
  },
};
