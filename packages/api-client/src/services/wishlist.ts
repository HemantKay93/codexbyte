import { apiClient } from '../apiClient';

export const WishlistService = {
  getWishlist: async () => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },

  toggleWishlist: async (productId: string) => {
    const response = await apiClient.post(`/wishlist/${productId}/toggle`);
    return response.data;
  },

  checkWishlist: async (productId: string) => {
    const response = await apiClient.get(`/wishlist/${productId}/check`);
    return response.data.isWishlisted;
  }
};
