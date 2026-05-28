import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/api/authApi';
import { storage } from '@/utils/storage';
import type { User, LoginRequest, RegisterRequest } from '@/types/user';

interface AuthContextType {
  user: Pick<User, '_id' | 'name' | 'email' | 'phone' | 'role'> | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session từ localStorage
  useEffect(() => {
    const savedToken = storage.getToken();
    const savedUser = storage.getUser<AuthContextType['user']>();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    storage.setToken(response.token);
    storage.setUser(response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    storage.setToken(response.token);
    storage.setUser(response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const loginWithGoogle = useCallback(async (googleToken: string) => {
    const response = await authApi.googleLogin(googleToken);
    storage.setToken(response.token);
    storage.setUser(response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
