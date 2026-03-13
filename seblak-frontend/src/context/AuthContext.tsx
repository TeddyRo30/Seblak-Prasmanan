'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User, LoginRequest, RegisterRequest } from '@/types';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      // Fetch current user
      api
        .get('/auth/me')
        .then((response: any) => {
          setUser(response.data);
        })
        .catch(() => {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/login', data);
      
      // Save tokens
      Cookies.set('accessToken', response.tokens.accessToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      Cookies.set('refreshToken', response.tokens.refreshToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      setUser(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/register', data);
      
      // Save tokens
      Cookies.set('accessToken', response.tokens.accessToken);
      Cookies.set('refreshToken', response.tokens.refreshToken);
      
      setUser(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook untuk menggunakan auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}