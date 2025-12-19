/**
 * API de autenticación
 * Funciones para consumir los endpoints de /api/Auth
 */

import { post, get } from '@/lib/apiClient';
import type { LoginRequest, LoginResult, CurrentUser } from './types';

/**
 * POST /api/Auth/login
 * Autenticar usuario y obtener token JWT
 */
export async function login(request: LoginRequest): Promise<LoginResult> {
  return post<LoginResult>('/api/Auth/login', request);
}

/**
 * GET /api/Auth/me
 * Obtener información del usuario actual autenticado
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  return get<CurrentUser>('/api/Auth/me');
}

export const authApi = {
  login,
  getCurrentUser,
};
