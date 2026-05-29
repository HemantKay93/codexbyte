import { apiClient } from '../apiClient';

export const PaymentService = {
  createRazorpayOrder: async (payload: {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    items: any[];
    receipt: string;
    shippingFee: number;
    discountAmount: number;
  }) => {
    const response = await apiClient.post('/payments/razorpay/order', payload);
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
  },
};
