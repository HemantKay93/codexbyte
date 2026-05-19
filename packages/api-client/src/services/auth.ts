import { apiClient } from '../apiClient';

export const AuthService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/customer/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  adminLogin: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('byteevolvr-user-storage'); // Correct Zustand persistence key
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/customer/me');
    return response.data.user;
  },

  getCurrentAdmin: async () => {
    const response = await apiClient.get('/auth/admin/me');
    return response.data.user;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await apiClient.post('/auth/customer/signup', { email, password, name });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
};
