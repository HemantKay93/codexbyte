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
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user-storage'); // Zustand persistence
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/customer/me');
    return response.data.user;
  },

  signup: async (payload: any) => {
    const response = await apiClient.post('/auth/customer/signup', payload);
    return response.data;
  }
};
