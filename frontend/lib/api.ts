import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from './auth';

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
const BASE_URL = `${API_ORIGIN}/api/v1`;

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Client-side GET cache: force-cache uses the browser HTTP cache.
  // Combined with PWA runtime caching, this dramatically reduces web requests
  // for immutable/near-immutable resources.
  // no explicit fetch cache policy here since axios bypasses that;
  // we implement lightweight server-side deduplication below.
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clear();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        tokenStorage.setTokens(data.accessToken, data.refreshToken);
        flushQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        tokenStorage.clear();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// --- Lightweight in-memory Request Dedup layer ----------------------------
// Prevents multiple in-flight calls to the same GET endpoint within a short
// window. Uses a Map keyed by URL with a 30-second dedup window.
// This dramatically speeds up pages where multiple sibling components
// independently fetch the same resource.
// ---------------------------------------------------------------------------

const inFlightRequests = new Map<string, Promise<unknown>>();
const DEDUP_WINDOW_MS = 30_000;

function requestKey(config: InternalAxiosRequestConfig): string {
  return `${config.method?.toLowerCase() ?? 'get'}:${config.baseURL ?? ''}${config.url ?? ''}:${JSON.stringify(config.params ?? {})}`;
}

export function invalidateGetCache() {
  inFlightRequests.clear();
}

const originalRequest = api.request.bind(api);
(api as unknown as Record<string, unknown>).request = (config: InternalAxiosRequestConfig) => {
  const key = requestKey(config);

  if (config.method?.toLowerCase() === 'get') {
    const existing = inFlightRequests.get(key);
    if (existing) return existing;
  }

  const promise = originalRequest(config)
    .then((response) => {
      if (config.method?.toLowerCase() === 'get') {
        inFlightRequests.set(key, Promise.resolve(response));
        setTimeout(() => {
          inFlightRequests.delete(key);
        }, DEDUP_WINDOW_MS);
      }
      return response;
    })
    .catch((err) => {
      inFlightRequests.delete(key);
      return Promise.reject(err);
    });

  if (config.method?.toLowerCase() === 'get') {
    inFlightRequests.set(key, promise);
  }

  return promise;
};

export { BASE_URL };
export default api;
