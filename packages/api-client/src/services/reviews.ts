import { apiClient } from '../apiClient';

export const ReviewService = {
  getReviews: async (productId: string) => {
    const response = await apiClient.get(`/reviews/${productId}`);
    return response.data;
  },


  addReview: async (productId: string, payload: { rating: number, comment: string }) => {
    const response = await apiClient.post(`/products/${productId}/reviews`, payload);
    return response.data;
  },

  getAllReviews: async () => {
    const response = await apiClient.get('/admin/reviews');
    return response.data;
  },

  updateReviewStatus: async (reviewId: string, status: string) => {
    const response = await apiClient.put(`/admin/reviews/${reviewId}`, { status });
    return response.data;
  }
};
