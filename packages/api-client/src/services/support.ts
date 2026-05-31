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
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/support/tickets', payload);
    return response.data;
  },

  updateTicket: async (id: string, payload: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.put(`/support/tickets/${id}`, payload);
    return response.data;
  },

  getTicket: async (id: string) => {
    const response = await apiClient.get(`/support/tickets/${id}`);
    return response.data;
  },

  replyToTicket: async (id: string, messageBody: string) => {
    const response = await apiClient.post(`/support/tickets/${id}/reply`, { messageBody });
    return response.data;
  }
};
