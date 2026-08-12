import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

const STORAGE_KEY = 'accusharp.auth';

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth) => {
  if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  else localStorage.removeItem(STORAGE_KEY);
};

let onError = null;

export const registerErrorHandler = (handler) => {
  onError = handler;
};

// Fired when a 401 survives a refresh attempt (or there's no refresh token to
// try) - AuthContext registers this to clear its state and redirect to /login.
let onAuthExpired = null;

export const registerAuthExpiredHandler = (handler) => {
  onAuthExpired = handler;
};

const isAuthEndpoint = (url) =>
  typeof url === 'string' && (url.includes('/auth/login') || url.includes('/auth/refresh'));

client.interceptors.request.use((config) => {
  const stored = getStoredAuth();
  if (stored?.accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${stored.accessToken}`;
  }
  return config;
});

// Shared in-flight refresh so concurrent 401s trigger exactly one /auth/refresh call.
let refreshPromise = null;

const doRefresh = () => {
  const stored = getStoredAuth();
  if (!stored?.refreshToken) return Promise.reject(new Error('No refresh token available'));
  if (!refreshPromise) {
    refreshPromise = axios
      .post('/api/auth/refresh', { refreshToken: stored.refreshToken })
      .then((r) => {
        const updated = { ...stored, ...r.data };
        setStoredAuth(updated);
        return updated;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const normalizeError = (error) => {
  const apiError = error.response?.data;
  const message =
    (apiError && typeof apiError === 'object' && apiError.message) ||
    error.message ||
    'Something went wrong while talking to the server.';
  const normalized = {
    message,
    status: error.response?.status,
    path: apiError?.path,
    raw: error,
  };
  if (onError) onError(normalized);
  return normalized;
};

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Exactly one silent refresh-and-retry per request; never for the auth
    // endpoints themselves, which would otherwise recurse.
    if (status === 401 && original && !original._retried && !isAuthEndpoint(original.url)) {
      original._retried = true;
      return doRefresh()
        .then((updated) => {
          original.headers = { ...original.headers, Authorization: `Bearer ${updated.accessToken}` };
          return client(original);
        })
        .catch(() => {
          setStoredAuth(null);
          if (onAuthExpired) onAuthExpired();
          return Promise.reject({
            message: 'Your session has expired. Please sign in again.',
            status: 401,
            raw: error,
          });
        });
    }

    return Promise.reject(normalizeError(error));
  }
);

export default client;
