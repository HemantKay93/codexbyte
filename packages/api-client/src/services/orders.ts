import axios from 'axios';

const metaEnv = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

const api = axios.create({
  baseURL: metaEnv?.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
});

// Interceptor to add auth token for requests
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const customerToken = localStorage.getItem('sb-access-token');
  const token = adminToken || customerToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateOrderPayload {
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  shippingAddress: any;
  paymentMethod: 'razorpay' | 'cod';
  totalAmount: number;
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await api.post('/orders', payload);
  return response.data;
}

export async function getOrders() {
  const response = await api.get('/orders');
  return response.data;
}

export async function updateOrder(id: string, payload: any) {
  const response = await api.put(`/orders/${id}`, payload);
  return response.data;
}
