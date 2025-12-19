"use client";

/**
 * useAuth - Hook para acceder al contexto de autenticación
 * Debe usarse dentro de un AuthProvider
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}
