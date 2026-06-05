import { apiClient } from '../apiClient';

export const CRMService = {
  // Pipelines
  getPipelines: () => apiClient.get('/crm/pipelines'),
  getBoardData: (pipelineId: string) => apiClient.get(`/crm/pipelines/${pipelineId}/board`),

  // Deals
  getDeals: () => apiClient.get('/crm/deals'),
  createDeal: (data: any) => apiClient.post('/crm/deals', data),
  moveDealStage: (dealId: string, stageId: string) => apiClient.put(`/crm/deals/${dealId}/stage`, { stage_id: stageId }),

  // Activities
  getDealActivities: (dealId: string) => apiClient.get(`/crm/deals/${dealId}/activities`),
  createActivity: (dealId: string, data: any) => apiClient.post(`/crm/deals/${dealId}/activities`, data),

  // Customer 360
  getCustomer360: (customerId: string) => apiClient.get(`/crm/customer-360/${customerId}`),

  // Dashboard
  getDashboardMetrics: () => apiClient.get('/crm/dashboard-metrics'),

  // Leads
  getLeads: () => apiClient.get('/crm/leads'),

  // Forecasting
  getSalesForecasts: () => apiClient.get('/crm/forecasts'),
};
