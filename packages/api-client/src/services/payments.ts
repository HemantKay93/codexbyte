import { apiClient } from '../apiClient';

export const PaymentService = {
  createRazorpayOrder: async (amount: number, receipt: string) => {
    const response = await apiClient.post('/payments/razorpay/order', { amount, receipt });
    return response.data;
  },


  verifyRazorpayPayment: async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await apiClient.post('/payments/verify', payload);
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await apiClient.get('/payments/methods');
    return response.data;
  }
};
