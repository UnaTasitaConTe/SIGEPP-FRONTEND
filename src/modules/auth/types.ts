/**
 * Tipos para el módulo de autenticación
 */

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Resultado del login (LoginResult según OpenAPI)
 * POST /api/Auth/login retorna este objeto
 */
export interface LoginResult {
  token: string;
  userId: string;
  name: string;
  email: string;
  roles: string[];
  expiresAt: string; // date-time según OpenAPI
}

/**
 * @deprecated Use LoginResult instead (aligned with OpenAPI spec)
 */
export type LoginResponse = LoginResult;

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

// Roles del sistema (según backend)
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
  CONSULTA_INTERNA = 'CONSULTA_INTERNA',
}
