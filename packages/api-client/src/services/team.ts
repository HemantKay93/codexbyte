import { apiClient } from '../apiClient';

export const TeamService = {
  getTeamMembers: async () => {
    const response = await apiClient.get('/admin/team');
    return response.data;
  },

  addTeamMember: async (payload: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/admin/team/invite', payload);
    return response.data;
  },

  updateTeamMemberRole: async (id: string, role: string) => {
    const response = await apiClient.put(`/admin/team/${id}/role`, { role });
    return response.data;
  },
};
