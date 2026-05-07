import axios from 'axios';

const metaEnv = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

const api = axios.create({
  baseURL: metaEnv?.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getReviews() {
  const response = await api.get('/reviews');
  return response.data;
}
