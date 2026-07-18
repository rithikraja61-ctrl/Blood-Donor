import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ROLES, TYPE_TO_BLOOD_GROUP } from '../utils/constants';
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  setAuthSession,
} from '../utils/authStorage';
import { loginUser, registerUser } from '../services/authService';
import { getUserProfile } from '../services/userService';
import { getHospitalProfile } from '../services/hospitalService';
import { getBloodBankProfile } from '../services/bloodBankService';
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
    name: profile.bloodBankName ?? profile.name ?? baseUser.name,
    phoneNumber: profile.phoneNumber ?? baseUser.phoneNumber,
    address: profile.address ?? baseUser.address,
    pincode: profile.pinCode ?? profile.pincode ?? baseUser.pincode,
    city: profile.city ?? baseUser.city,
    state: profile.state ?? baseUser.state,
    licenseNumber: profile.licenseNumber ?? baseUser.licenseNumber,
    available: profile.available ?? baseUser.available,
    bloodGroup: profile.bloodType
      ? TYPE_TO_BLOOD_GROUP[profile.bloodType] || profile.bloodType
      : baseUser.bloodGroup,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getAuthUser());
  const [token, setToken] = useState(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    clearAuthSession();
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

    setAuthSession(authData.token, authUser);
    setToken(authData.token);
    setUser(authUser);
    return authUser;
  }, []);

  const hydrateUserProfile = useCallback(async (authData) => {
    const baseUser = {
      id: authData.id,
      email: authData.email,
      role: authData.role,
    };

    setAuthSession(authData.token, baseUser);
    setToken(authData.token);
    setUser(baseUser);

    try {
      if (authData.role === ROLES.USER) {
        return persistAuth(authData, await getUserProfile());
      }
      if (authData.role === ROLES.HOSPITAL) {
        return persistAuth(authData, await getHospitalProfile());
      }
      if (authData.role === ROLES.BLOOD_BANK) {
        return persistAuth(authData, await getBloodBankProfile());
      }
    } catch {
      // Profile fetch failed; keep auth with base user fields.
    }

    return persistAuth(authData);
  }, [persistAuth]);

  const syncProfile = useCallback((profile) => {
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();
    if (!storedUser || !storedToken) return null;
    return persistAuth({ token: storedToken, ...storedUser }, profile);
  }, [persistAuth]);

  const login = async (role, email, password) => {
    const data = await loginUser(role, email, password);
    return hydrateUserProfile(data);
  };

  const register = async (role, formData) => {
    const data = await registerUser(role, formData);
    const seedProfile = role === 'Blood Bank'
      ? {
          bloodBankName: formData.bloodBankName?.trim(),
          name: formData.bloodBankName?.trim(),
        }
      : null;

    if (seedProfile?.name) {
      persistAuth(data, seedProfile);
    }

    return hydrateUserProfile(data);
  };

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();

      if (!storedToken || !isTokenValid(storedToken)) {
        clearAuth();
        setIsLoading(false);
        return;
      }

      try {
        const storedUser = getAuthUser();

        if (storedUser?.role === ROLES.USER) {
          const profile = await getUserProfile();
          persistAuth({ token: storedToken, ...storedUser }, profile);
        } else if (storedUser?.role === ROLES.HOSPITAL) {
          const profile = await getHospitalProfile();
          persistAuth({ token: storedToken, ...storedUser }, profile);
        } else if (storedUser?.role === ROLES.BLOOD_BANK) {
          const profile = await getBloodBankProfile();
          persistAuth({ token: storedToken, ...storedUser }, profile);
        } else {
          setToken(storedToken);
          setUser(storedUser);
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
      syncProfile,
    }),
    [user, token, isLoading, logout, syncProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
