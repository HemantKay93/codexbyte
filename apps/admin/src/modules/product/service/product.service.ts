import { apiClient } from '@byteevolvr/api-client';
import { Product, ProductFormData } from '../types/product.types';

export const ProductService = {
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get('/admin/products');
    return response.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
  },

  async createProduct(data: ProductFormData): Promise<Product> {
    const response = await apiClient.post('/admin/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const response = await apiClient.put(`/admin/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}`);
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  }
};
