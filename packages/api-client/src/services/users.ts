import { apiClient } from '../apiClient';

export const UserService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (payload: any) => {
    const response = await apiClient.put('/users/profile', payload);
    return response.data;
  },

  getAddresses: async () => {
    const response = await apiClient.get('/users/addresses');
    return response.data;
  },

  addAddress: async (payload: any) => {
    const response = await apiClient.post('/users/addresses', payload);
    return response.data;
  },

  updateAddress: async (id: string, payload: any) => {
    const response = await apiClient.put(`/users/addresses/${id}`, payload);
    return response.data;
  },

  deleteAddress: async (id: string) => {
    const response = await apiClient.delete(`/users/addresses/${id}`);
    return response.data;
  }
};
