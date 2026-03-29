import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Axios instance shared across auth and user API calls
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send HTTP-only refresh token cookie automatically
});

// Track whether a refresh is already in flight to avoid parallel refresh calls
let isRefreshing = false;
let pendingRequests = [];

const processPending = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingRequests = [];
};

/**
 * Attach the access token to every outgoing request.
 * The token is injected by AuthContext via setAccessToken().
 */
export const setAccessToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Response interceptor: on 401, attempt a silent token refresh once,
 * then replay the original request. If refresh fails, redirect to /login.
 * Requirement 5.4
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once and only for 401s that aren't the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue the request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refresh();
        const newToken = data.data.access_token;
        setAccessToken(newToken);
        processPending(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processPending(refreshError, null);
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth API functions ────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {string} email
 * @param {string} password
 */
export const register = (email, password) =>
  apiClient.post('/api/v1/auth/register', { email, password });

/**
 * Log in with email and password.
 * The backend sets the refresh token as an HTTP-only cookie.
 * Returns { data: { access_token } } inside the response envelope.
 * @param {string} email
 * @param {string} password
 */
export const login = (email, password) =>
  apiClient.post('/api/v1/auth/login', { email, password });

/**
 * Exchange the HTTP-only refresh token cookie for a new access token.
 * withCredentials ensures the cookie is sent automatically.
 */
export const refresh = () =>
  apiClient.post('/api/v1/auth/refresh');

/**
 * Log out — clears the in-memory access token and the refresh cookie.
 * The backend should clear the cookie on this call; if no dedicated
 * logout endpoint exists we just clear client-side state.
 */
export const logout = () => {
  setAccessToken(null);
  // Best-effort server-side cookie clear (endpoint may not exist yet)
  return apiClient.post('/api/v1/auth/logout').catch(() => {});
};
