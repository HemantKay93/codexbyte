import { apiClient } from '../apiClient';

export const WorkflowsService = {
  getWorkflows: () => apiClient.get('/workflows'),
  createWorkflow: (data: any) => apiClient.post('/workflows', data),
  updateWorkflow: (id: string, data: any) => apiClient.put(`/workflows/${id}`, data),
  
  getExecutions: (workflowId?: string) => apiClient.get(`/workflows/executions${workflowId ? `?workflowId=${workflowId}` : ''}`),
};
