import { apiClient } from '../apiClient';

export const TeamService = {
  getTeamMembers: async () => {
    const response = await apiClient.get('/team');
    return response.data;
  },


  addTeamMember: async (payload: any) => {
    const response = await apiClient.post('/team', payload);
    return response.data;
  }
};
