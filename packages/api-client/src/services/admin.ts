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

  updateOrderStatus: async (
    orderId: string,
    data: { status?: string; trackingId?: string; courier?: string }
  ) => {
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
    const response = await apiClient.post('/pos/checkout', data);
    return response.data;
  },

  getPosProducts: async (params?: any) => {
    const response = await apiClient.get('/pos/products', { params });
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
  },

  getWarehouses: async () => {
    const response = await apiClient.get('/admin/warehouse');
    return response.data;
  },

  createWarehouse: async (data: any) => {
    const response = await apiClient.post('/admin/warehouse', data);
    return response.data;
  },

  updateWarehouse: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/warehouse/${id}`, data);
    return response.data;
  },

  getWarehouseInventory: async (id: string) => {
    const response = await apiClient.get(`/admin/warehouse/${id}/inventory`);
    return response.data;
  },

  getNotifications: async () => {
    const response = await apiClient.get('/admin/notifications');
    return response.data;
  },

  markNotificationAsRead: async (id: string) => {
    const response = await apiClient.put(`/admin/notifications/${id}/read`);
    return response.data;
  },

  adjustStock: async (data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/admin/warehouse/adjust-stock', data);
    return response.data;
  },

  getOrderActivity: async (id: string) => {
    const response = await apiClient.get(`/admin/orders/${id}/activity`);
    return response.data;
  },

  processReturn: async (
    orderId: string,
    data: {
      items: { productId: string; quantity: number }[];
      warehouseId: string;
      reason: string;
      refundAmount?: number;
    }
  ) => {
    const response = await apiClient.post(`/admin/orders/${orderId}/return`, data);
    return response.data;
  },

  getSalesReport: async (days = 7) => {
    const response = await apiClient.get('/admin/sales-report', { params: { days } });
    return response.data;
  },

  markTaskPicked: async (data: { orderId: string; productId?: string; notes?: string }) => {
    const response = await apiClient.post('/admin/warehouse/tasks/pick', data);
    return response.data;
  },

  // Returns (RMA)
  getRmaReturns: async (params?: any) => {
    const response = await apiClient.get('/admin/returns', { params });
    return response.data;
  },

  updateRmaStatus: async (id: string, data: { status: string; notes?: string }) => {
    const response = await apiClient.put(`/admin/returns/${id}`, data);
    return response.data;
  },

  // Marketing & Coupons
  getCoupons: async () => {
    const response = await apiClient.get('/admin/marketing/coupons');
    return response.data;
  },

  createCoupon: async (data: any) => {
    const response = await apiClient.post('/admin/marketing/coupons', data);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: any) => {
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
  },
};
