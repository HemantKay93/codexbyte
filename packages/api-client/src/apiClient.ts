import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const metaEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;

const BASE_URL = metaEnv?.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Retry Logic Helper
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1s

// Request Interceptor: Auth Injection
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling & Retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    // 1. Handle Retry for Network Errors or 5xx
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;

    if ((isNetworkError || isServerError) && (config._retryCount || 0) < MAX_RETRIES) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1); // Exponential backoff
      
      console.warn(`[API] Retrying request (${config._retryCount}/${MAX_RETRIES}) in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(config);
    }

    // 2. Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401) {
      // Clear token if definitely invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_token');
      console.error('Session expired. Please login again.');
      
      // Optional: window.location.href = '/login' if not in a service context
    }

    // 3. Centralized Error Reporting
    const errorMessage = (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
    
    return Promise.reject({
      ...error,
      customMessage: errorMessage,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    });
  }
);

// Utility: Health Check
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    return { ok: false, error: 'API unreachable' };
  }
};
