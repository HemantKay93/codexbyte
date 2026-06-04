import { apiClient } from '../apiClient';

export const SLAService = {
  getPolicies: () => apiClient.get('/sla/policies'),
  createPolicy: (data: any) => apiClient.post('/sla/policies', data),
  
  getBreaches: () => apiClient.get('/sla/breaches'),
  acknowledgeBreach: (id: string) => apiClient.put(`/sla/breaches/${id}/acknowledge`),
};
