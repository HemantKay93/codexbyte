import { apiClient } from '../apiClient';

export const OperationsService = {
  getSystemHealth: () => apiClient.get('/operations/health')
};
