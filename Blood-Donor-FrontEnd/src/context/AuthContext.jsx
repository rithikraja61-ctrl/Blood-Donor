import { createContext, useContext, useMemo, useState } from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_USER_KEY));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));

  const persistAuth = (authData) => {
    const authUser = { id: authData.id, email: authData.email, role: authData.role };
    localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    setToken(authData.token);
    setUser(authUser);
  };

  const login = async (role, email, password) => {
    const data = await loginUser(role, email, password);
    persistAuth(data);
    return data;
  };

  const register = async (role, formData) => {
    const data = await registerUser(role, formData);
    persistAuth(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), login, register, logout }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
