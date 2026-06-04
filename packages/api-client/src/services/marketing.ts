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
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/marketing/coupons', data);
    return response.data;
  },

  validateCoupon: async (code: string, orderAmount: number) => {
    const response = await apiClient.post('/marketing/validate-coupon', { code, orderAmount });
    return response.data;
  },

  // Campaigns
  getCampaigns: async () => {
    const response = await apiClient.get('/marketing/campaigns');
    return response.data;
  },

  // Segments
  getSegments: async () => {
    const response = await apiClient.get('/marketing/segments');
    return response.data;
  },
  createSegment: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/marketing/segments', data);
    return response.data;
  },
  updateSegment: async (id: string, data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.put(`/marketing/segments/${id}`, data);
    return response.data;
  },

  // Automations
  getAutomations: async () => {
    const response = await apiClient.get('/marketing/automations');
    return response.data;
  },
  createAutomation: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/marketing/automations', data);
    return response.data;
  },

  // Templates (Email)
  getEmailTemplates: async () => {
    const response = await apiClient.get('/marketing/templates/email');
    return response.data;
  },
  createEmailTemplate: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/marketing/templates/email', data);
    return response.data;
  },
  updateEmailTemplate: async (id: string, data: any) => {
    const response = await apiClient.put(`/marketing/templates/email/${id}`, data);
    return response.data;
  },

  // Templates (Push)
  getPushTemplates: async () => {
    const response = await apiClient.get('/marketing/templates/push');
    return response.data;
  },
  createPushTemplate: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/marketing/templates/push', data);
    return response.data;
  },
  updatePushTemplate: async (id: string, data: any) => {
    const response = await apiClient.put(`/marketing/templates/push/${id}`, data);
    return response.data;
  },
};
