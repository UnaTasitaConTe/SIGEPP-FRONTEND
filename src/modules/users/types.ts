/**
 * Tipos para el módulo de Users (Gestión de Usuarios)
 * Alineados con la especificación OpenAPI de SIGEPP
 */

// ============================================================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================================================

/**
 * DTO de rol de usuario
 * Representa un rol asignado a un usuario
 */
export interface UserRoleDto {
  code: string;
  name: string;
  description: string;
}

/**
 * DTO básico de usuario para listados
 * GET /api/Users
 */
export interface UserDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

/**
 * DTO detallado de usuario
 * GET /api/Users/{id}
 */
export interface UserDetailDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: UserRoleDto[];
  permissions: string[];
}

// ============================================================================
// COMMANDS - INPUT PARA CREAR/ACTUALIZAR
// ============================================================================

/**
 * Comando para crear un nuevo usuario
 * POST /api/Users
 */
export interface CreateUserCommand {
  name: string; // minLength: 3, maxLength: 200
  email: string; // maxLength: 256
  rawPassword: string; // minLength: 6, maxLength: 100
  roleCodes?: string[]; // opcional
  isActive?: boolean; // opcional, default true
}

/**
 * Comando para actualizar un usuario existente
 * PUT /api/Users/{id}
 */
export interface UpdateUserCommand {
  name: string; // minLength: 3, maxLength: 200
  email: string; // maxLength: 256
  roleCodes?: string[] | null; // opcional
}

/**
 * Request para asignar roles a un usuario
 * POST /api/Users/{id}/roles
 */
export interface AssignRolesRequest {
  roleCodes: string[]; // minItems: 1
}

/**
 * Request para cambiar contraseña de un usuario
 * PUT /api/Users/{id}/password
 */
export interface ChangePasswordRequest {
  newPassword: string; // minLength: 6, maxLength: 100
}

// ============================================================================
// HELPERS Y UTILIDADES
// ============================================================================

/**
 * Roles disponibles en el sistema
 * Basados en el backend SIGEPP
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
  CONSULTA_INTERNA = 'CONSULTA_INTERNA',
}

/**
 * Labels en español para los roles
 */
export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.DOCENTE]: 'Docente',
  [UserRole.CONSULTA_INTERNA]: 'Consulta Interna',
};

/**
 * Descripciones de los roles
 */
export const UserRoleDescriptions: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Acceso completo al sistema',
  [UserRole.DOCENTE]: 'Puede crear y gestionar PPAs',
  [UserRole.CONSULTA_INTERNA]: 'Solo lectura en el sistema',
};

/**
 * Obtiene el color de badge según el estado del usuario
 */
export function getUserStatusColor(isActive: boolean): {
  bg: string;
  text: string;
  border: string;
} {
  return isActive
    ? {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      }
    : {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
      };
}

/**
 * Obtiene el color de badge según el rol
 */
export function getRoleBadgeColor(roleCode: string): {
  bg: string;
  text: string;
} {
  switch (roleCode) {
    case UserRole.ADMIN:
      return { bg: 'bg-[#e30513]/10', text: 'text-[#630b00]' };
    case UserRole.DOCENTE:
      return { bg: 'bg-blue-50', text: 'text-blue-700' };
    case UserRole.CONSULTA_INTERNA:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}
