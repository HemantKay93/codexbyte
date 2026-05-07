import axios from 'axios';

const metaEnv = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

const api = axios.create({
  baseURL: metaEnv?.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
});

export async function createShiprocketShipment(payload: Record<string, unknown>) {
  const response = await api.post('/shipping/shiprocket', payload);
  return response.data;
}

export async function getTrackingById(trackingId: string) {
  const response = await api.get(`/tracking/${trackingId}`);
  return response.data;
}
