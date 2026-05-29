import { apiClient } from '../apiClient';

export const AdminService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getRevenueChart: async (months = 6) => {
    const response = await apiClient.get('/admin/revenue-chart', { params: { months } });
    return response.data;
  },

  getIntegrationHealth: async () => {
    const response = await apiClient.get('/admin/health/integrations');
    return response.data;
  },

  getOrders: async (params?: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
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
    return response.data?.data || response.data;
  },

  getCustomers: async () => {
    const response = await apiClient.get('/admin/customers');
    return response.data;
  },

  bulkImportProducts: async (products: any[]) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/admin/products/bulk-import', { products });
    return response.data;
  },

  createOrder: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/pos/checkout', data);
    return response.data;
  },

  getPosProducts: async (params?: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get('/pos/products', { params });
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
    return response.data?.data || response.data;
  },

  createWarehouse: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/admin/warehouse', data);
    return response.data;
  },

  updateWarehouse: async (id: string, data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
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
    return response.data?.data;
  },

  transferStock: async (data: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/admin/warehouse/transfer-stock', data);
    return response.data?.data;
  },

  getStockMovements: async (productId: string) => {
    const response = await apiClient.get(`/admin/warehouse/movements/${productId}`);
    return response.data?.data;
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
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get('/admin/returns', { params });
    return response.data;
  },

  updateRmaStatus: async (id: string, data: { status: string; notes?: string }) => {
    const response = await apiClient.put(`/admin/returns/${id}`, data);
    return response.data;
  },

  // Marketing & Coupons
  getCoupons: async () => {
    const response = await apiClient.get('/marketing/coupons');
    return response.data;
  },

  createCoupon: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/marketing/coupons', data);
    return response.data;
  },

  // Suppliers & Purchase Orders
  getSuppliers: async () => {
    const response = await apiClient.get('/suppliers');
    return response.data;
  },

  createSupplier: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  getPurchaseOrders: async (supplierId?: string) => {
    const response = await apiClient.get('/suppliers/po', { params: { supplierId } });
    return response.data;
  },

  createPurchaseOrder: async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post('/suppliers/po', data);
    return response.data;
  },

  receivePurchaseOrder: async (id: string, warehouseId: string) => {
    const response = await apiClient.post(`/suppliers/po/${id}/receive`, { warehouseId });
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
  },
};
