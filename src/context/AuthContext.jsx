import { createContext, useState, useCallback } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  refresh as apiRefresh,
  setAccessToken,
} from '../api/authApi';

const AuthContext = createContext(null);

/**
 * AuthProvider stores the access token in React state (memory only).
 * The refresh token lives in an HTTP-only cookie managed by the backend.
 * Requirements 5.2, 5.5
 */
export function AuthProvider({ children }) {
  // Access token is kept in memory — never written to localStorage/sessionStorage
  const [accessToken, setToken] = useState(null);

  /**
   * Log in: call the API, store the returned access token in state,
   * and configure the axios client to send it on future requests.
   */
  const login = useCallback(async (email, password) => {
    const response = await apiLogin(email, password);
    const token = response.data.data.access_token;
    setToken(token);
    setAccessToken(token);
    return response;
  }, []);

  /**
   * Log out: clear the in-memory token and call the API to clear the cookie.
   * Requirement 5.5
   */
  const logout = useCallback(async () => {
    setToken(null);
    setAccessToken(null);
    await apiLogout();
  }, []);

  /**
   * Silently refresh the access token using the HTTP-only cookie.
   * Called automatically by the axios interceptor on 401 responses.
   */
  const refreshToken = useCallback(async () => {
    const response = await apiRefresh();
    const token = response.data.data.access_token;
    setToken(token);
    setAccessToken(token);
    return token;
  }, []);

  const value = {
    accessToken,
    isAuthenticated: Boolean(accessToken),
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
