import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, ROLES, TYPE_TO_BLOOD_GROUP } from '../utils/constants';
import { loginUser, registerUser } from '../services/authService';
import { getUserProfile } from '../services/userService';
import { getHospitalProfile } from '../services/hospitalService';
import { ApiError } from '../services/apiClient';

const AuthContext = createContext(null);

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function mapProfileToUser(baseUser, profile) {
  if (!profile) return baseUser;

  return {
    ...baseUser,
    name: profile.name ?? baseUser.name,
    phoneNumber: profile.phoneNumber ?? baseUser.phoneNumber,
    address: profile.address ?? baseUser.address,
    pincode: profile.pincode ?? baseUser.pincode,
    city: profile.city ?? baseUser.city,
    state: profile.state ?? baseUser.state,
    licenseNumber: profile.licenseNumber ?? baseUser.licenseNumber,
    bloodGroup: profile.bloodType
      ? TYPE_TO_BLOOD_GROUP[profile.bloodType] || profile.bloodType
      : baseUser.bloodGroup,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_USER_KEY));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const persistAuth = useCallback((authData, profile = null) => {
    const authUser = mapProfileToUser(
      {
        id: authData.id,
        email: authData.email,
        role: authData.role,
      },
      profile,
    );

    localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    setToken(authData.token);
    setUser(authUser);
    return authUser;
  }, []);

  const hydrateUserProfile = useCallback(async (authData) => {
    if (authData.role === ROLES.USER) {
      try {
        const profile = await getUserProfile();
        return persistAuth(authData, profile);
      } catch {
        return persistAuth(authData);
      }
    }

    if (authData.role === ROLES.HOSPITAL) {
      try {
        const profile = await getHospitalProfile();
        return persistAuth(authData, profile);
      } catch {
        return persistAuth(authData);
      }
    }

    return persistAuth(authData);
  }, [persistAuth]);

  const login = async (role, email, password) => {
    const data = await loginUser(role, email, password);
    return hydrateUserProfile(data);
  };

  const register = async (role, formData) => {
    const data = await registerUser(role, formData);
    return hydrateUserProfile(data);
  };

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

      if (!storedToken || !isTokenValid(storedToken)) {
        clearAuth();
        setIsLoading(false);
        return;
      }

      try {
        const storedUser = JSON.parse(localStorage.getItem(AUTH_USER_KEY));

        if (storedUser?.role === ROLES.USER) {
          const profile = await getUserProfile();
          persistAuth({ token: storedToken, ...storedUser }, profile);
        } else if (storedUser?.role === ROLES.HOSPITAL) {
          const profile = await getHospitalProfile();
          persistAuth({ token: storedToken, ...storedUser }, profile);
        }
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clearAuth, persistAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token) && isTokenValid(token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
