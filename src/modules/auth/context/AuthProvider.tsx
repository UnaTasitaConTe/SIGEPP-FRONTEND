"use client";

/**
 * AuthProvider - Contexto de autenticación
 * Maneja el estado del usuario, login, logout y recuperación de sesión
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api';
import { UnauthorizedError } from '@/lib/apiClient';
import type { CurrentUser } from '../types';

const TOKEN_KEY = 'auth_token';

interface AuthContextValue {
  user: CurrentUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Recuperar sesión al montar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Intentar obtener usuario actual
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        setToken(storedToken);
      } catch (error) {
        // Si falla (401 u otro error), limpiar sesión
        console.error('Error recuperando sesión:', error);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await authApi.login({ email, password });

        // Guardar token en localStorage
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);


        const currentUser = await authApi.getCurrentUser();
     

        setUser(currentUser);

        // Redirigir a dashboard
        router.push('/dashboard');
      } catch (error) {
        // Re-lanzar el error para que el componente lo maneje
        throw error;
      }
    },
    [router]
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    router.push('/login');
  }, [router]);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
