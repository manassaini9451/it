import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

export const setToken = (t: string) =>
  typeof window !== 'undefined' &&
  localStorage.setItem('access_token', t);

export const clearToken = () =>
  typeof window !== 'undefined' &&
  localStorage.removeItem('access_token');

const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

api.interceptors.request.use((cfg) => {
  const isPublic = PUBLIC_ENDPOINTS.some((ep) =>
    cfg.url?.includes(ep),
  );

  const token = getToken();

  if (token && cfg.headers && !isPublic) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }

  return cfg;
});

let refreshing = false;
let queue: any[] = [];

const processQueue = (
  err: any,
  token: string | null = null,
) => {
  queue.forEach((p) =>
    err ? p.reject(err) : p.resolve(token),
  );

  queue = [];
};

api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      refreshing = true;

      try {
        const response = await axios.post(
          `${API_URL}/v1/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        const token = response.data.data.accessToken;

        setToken(token);

        processQueue(null, token);

        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);

        clearToken();

        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }

        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default api;