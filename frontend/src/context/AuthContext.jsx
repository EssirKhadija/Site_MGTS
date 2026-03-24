import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);

    // 2FA required
    if (res.data?.requires2FA) return { requires2FA: true, userId: res.data.userId };

    localStorage.setItem('accessToken',  res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setUser(res.data.user);
    return { requires2FA: false };
  };

  const loginWith2FA = async (userId, totpToken) => {
    const res = await authAPI.verify2FA({ userId, totpToken });
    localStorage.setItem('accessToken',  res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await authAPI.logout({ refreshToken }).catch(() => {});
    localStorage.clear();
    setUser(null);
  };

  const value = { user, loading, login, loginWith2FA, logout, fetchMe };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);