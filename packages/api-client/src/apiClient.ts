import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const metaEnv = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

let BASE_URL = metaEnv?.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}

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

    // Inject Observability Headers
    if (config.headers) {
      const traceId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15);
      config.headers['X-Trace-Id'] = traceId;
      config.headers['X-Correlation-Id'] = traceId; // Using traceId as correlationId for frontend requests for simplicity

      const tenantId = localStorage.getItem('tenant_id');
      if (tenantId) {
        config.headers['X-Tenant-Id'] = tenantId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Data Extraction & Error Handling
apiClient.interceptors.response.use(
  (response) => {
    // Automatically extract 'data' if the response follows the { success, data } standard
    if (
      response.data &&
      typeof response.data === 'object' &&
      response.data.success === true &&
      response.data.data !== undefined
    ) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    // 1. Handle Retry for Network Errors or 5xx
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;

    if ((isNetworkError || isServerError) && (config._retryCount || 0) < MAX_RETRIES) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1); // Exponential backoff

      console.warn(
        `[API] Retrying request (${config._retryCount}/${MAX_RETRIES}) in ${delay}ms... Status: ${error.response?.status || 'Network Error'}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config);
    }

    // 2. Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401) {
      // Clear token if definitely invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('byteevolvr-user-storage'); // Clear persisted user state on auth failure
      console.error('Session expired. Please login again.');

      // Redirect to login if on the client side
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        const loginPath = window.location.pathname.startsWith('/shop') ? '/shop/login' : '/login';
        window.location.href = loginPath;
      }
    }

    // 3. Centralized Error Reporting
    const errorMessage =
      (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
    // eslint-disable-line @typescript-eslint/no-explicit-any

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
    // eslint-disable-line @typescript-eslint/no-unused-vars
    return { ok: false, error: 'API unreachable' };
  }
};
