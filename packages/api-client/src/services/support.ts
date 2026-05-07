import { apiClient } from '../apiClient';

export const SupportService = {
  getTickets: async () => {
    const response = await apiClient.get('/support/tickets');
    return response.data;
  },


  createTicket: async (payload: any) => {
    const response = await apiClient.post('/support/tickets', payload);
    return response.data;
  }
};
