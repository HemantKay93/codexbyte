import { apiClient } from '../apiClient';

export const ApprovalsService = {
  getTemplates: () => apiClient.get('/approvals/templates'),
  createTemplate: (data: any) => apiClient.post('/approvals/templates', data),
  
  getRequests: () => apiClient.get('/approvals/requests'),
  getInbox: () => apiClient.get('/approvals/inbox'),
  triggerApproval: (data: any) => apiClient.post('/approvals/requests', data),
  
  processStep: (requestId: string, stepId: string, status: string, comments?: string) => 
    apiClient.put(`/approvals/requests/${requestId}/steps/${stepId}`, { status, comments }),
};
