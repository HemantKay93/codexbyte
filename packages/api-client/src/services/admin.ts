import { apiClient } from '../apiClient';

export const AdminService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getOrders: async (params?: any) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  getOrderDetail: async (id: string) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, data: { status?: string, trackingId?: string, courier?: string }) => {
    const response = await apiClient.put(`/admin/orders/${orderId}`, data);
    return response.data;
  },

  getProducts: async () => {
    const response = await apiClient.get('/admin/products');
    return response.data;
  },

  getCustomers: async () => {
    const response = await apiClient.get('/admin/customers');
    return response.data;
  },

  bulkImportProducts: async (products: any[]) => {
    const response = await apiClient.post('/admin/products/bulk-import', { products });
    return response.data;
  },

  createOrder: async (data: any) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
  
  getWarehouseTasks: async () => {
    const response = await apiClient.get('/admin/warehouse/tasks');
    return response.data;
  },

  getCustomerDetail: async (id: string) => {
    const response = await apiClient.get(`/admin/customers/${id}`);
    return response.data;
  }
};
