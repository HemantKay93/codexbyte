import axios from 'axios';

const metaEnv = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

const api = axios.create({
  baseURL: metaEnv?.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
});

export async function createRazorpayOrder(amount: number, receipt: string) {
  const response = await api.post('/payments/razorpay/order', { amount, receipt });
  return response.data;
}

export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const response = await api.post('/payments/verify', payload);
  return response.data;
}
