import { createContext, useCallback, useEffect, useState } from 'react';
import {
  adminLogin as apiAdminLogin,
  login as apiUserLogin,
  logout as apiLogout,
  refresh as apiRefresh,
  setAccessToken,
} from '../api/authApi';
import { getProfile } from '../api/userApi';

const AuthContext = createContext(null);

const ROLE_KEY = 'app_role';

export function AuthProvider({ children }) {
  const [accessToken, setToken] = useState(null);
  const [role, setRole] = useState(() => window.localStorage.getItem(ROLE_KEY) || '');
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applyAuth = (response, fallbackRole) => {
    const token = response.data.data.access_token;
    const nextRole = response.data.data.role || fallbackRole;
    setToken(token);
    setRole(nextRole);
    setAccessToken(token);
    window.localStorage.setItem(ROLE_KEY, nextRole);
    
    // Fetch profile immediately after login
    getProfile().then(res => {
      setUser(res.data?.data ?? res.data);
    }).catch(() => {});

    return response;
  };

  const login = useCallback(async (email, password) => {
    const response = await apiUserLogin(email, password);
    return applyAuth(response, 'user');
  }, []);

  const loginAdmin = useCallback(async (email, password, adminPasscode) => {
    const response = await apiAdminLogin(email, password, adminPasscode);
    return applyAuth(response, 'admin');
  }, []);



  const logout = useCallback(async () => {
    setToken(null);
    setRole('');
    setUser(null);
    setAccessToken(null);
    window.localStorage.removeItem(ROLE_KEY);
    await apiLogout();
  }, []);

  const refreshToken = useCallback(async () => {
    const response = await apiRefresh();
    const token = response.data.data.access_token;
    setToken(token);
    setAccessToken(token);
    return token;
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiRefresh()
      .then((response) => {
        if (!isMounted) {
          return;
        }
        const token = response.data?.data?.access_token;
        if (!token) {
          setIsBootstrapping(false);
          return;
        }

        setToken(token);
        setAccessToken(token);
        
        // Fetch profile if we have a token
        getProfile().then(res => {
          if (isMounted) {
            setUser(res.data?.data ?? res.data);
          }
        }).catch(() => {});

        if (!window.localStorage.getItem(ROLE_KEY)) {
          window.localStorage.setItem(ROLE_KEY, 'user');
          setRole('user');
        }
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setToken(null);
        setRole('');
        setAccessToken(null);
        window.localStorage.removeItem(ROLE_KEY);
      })
      .finally(() => {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        role,
        user,
        setUser,
        isAuthenticated: Boolean(accessToken),
        isBootstrapping,
        login,
        loginAdmin,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

