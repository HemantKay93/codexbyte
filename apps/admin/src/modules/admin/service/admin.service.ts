import { apiClient } from '@byteevolvr/api-client';

export const AdminService = {
  async getDashboardStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  async getOrders(params?: any) {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  async getOrderDetail(id: string) {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(orderId: string, data: { status?: string, trackingId?: string, courier?: string }) {
    const response = await apiClient.put(`/admin/orders/${orderId}`, data);
    return response.data;
  },

  async getProducts() {
    const response = await apiClient.get('/admin/products');
    return response.data;
  },

  async getCustomers() {
    const response = await apiClient.get('/admin/customers');
    return response.data;
  }
};
