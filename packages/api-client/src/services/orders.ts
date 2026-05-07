import { apiClient } from '../apiClient';

export interface CreateOrderPayload {
  userId?: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  shippingAddress: any;
  paymentMethod: 'razorpay' | 'cod';
  totalAmount: number;
}

export const OrderService = {
  createOrder: async (payload: CreateOrderPayload) => {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },

  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  updateOrder: async (id: string, payload: any) => {
    const response = await apiClient.put(`/orders/${id}`, payload);
    return response.data;
  },

  deleteOrder: async (id: string) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },

  getOrderItems: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}/items`);
    return response.data;
  },
};
