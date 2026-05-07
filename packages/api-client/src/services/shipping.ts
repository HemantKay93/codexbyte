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

  calculateShippingRates: async (payload: any) => {
    const response = await apiClient.post('/shipping/rates', payload);
    return response.data;
  }
};
