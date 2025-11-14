'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '@/lib/api';
import { ApiUser, AuthResponse } from '@/lib/types';

type AuthContextValue = {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const TOKEN_STORAGE_KEY = 'jaspers_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistAuth = (payload: AuthResponse) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (typeof window === 'undefined') {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setToken(storedToken);
      }

      try {
        const profile = await authApi.me(storedToken);
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        if (!cancelled) {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAuthSuccess = useCallback((payload: AuthResponse) => {
    setUser(payload.user);
    setToken(payload.token);
    persistAuth(payload);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);
      handleAuthSuccess(response);
    },
    [handleAuthSuccess],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.register(email, password);
      handleAuthSuccess(response);
    },
    [handleAuthSuccess],
  );

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

