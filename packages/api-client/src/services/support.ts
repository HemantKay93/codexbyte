import { apiClient } from '../apiClient';

export const SupportService = {
  getMyTickets: async () => {
    const response = await apiClient.get('/support/me');
    return response.data;
  },

  getAllTickets: async () => {
    const response = await apiClient.get('/support/tickets');
    return response.data;
  },

  createTicket: async (payload: any) => {
    const response = await apiClient.post('/support/tickets', payload);
    return response.data;
  },

  updateTicket: async (id: string, payload: any) => {
    const response = await apiClient.put(`/support/tickets/${id}`, payload);
    return response.data;
  },
};
