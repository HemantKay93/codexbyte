import axios from 'axios';

const metaEnv = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

const api = axios.create({
  baseURL: metaEnv?.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
});

// Interceptor to add auth token for admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category: string;
  brand?: string;
  sku?: string;
  stock_quantity: number;
  tags?: string[];
  status?: 'active' | 'draft' | 'out_of_stock';
  featured?: boolean;
  sort_order?: number;
  specifications?: Array<{ key: string; value: string }>;
  qna?: Array<{ question: string; answer: string }>;
  reviews?: Array<{ user: string; rating: number; comment: string }>;
}

export async function getProducts(): Promise<Product[]> {
  const response = await api.get('/products');
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function createProduct(payload: Product): Promise<Product> {
  const response = await api.post('/products', payload);
  return response.data;
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const response = await api.put(`/products/${id}`, payload);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
