/**
 * API de Users - Funciones para interactuar con el backend de gestión de usuarios
 * Alineado con la especificación OpenAPI de SIGEPP
 */

import { apiClient } from '@/lib/apiClient';
import { BasePagedService } from '@/services/basePagedService';
import type { BasePagedParams } from '@/types/common';
import type {
  UserDto,
  UserDetailDto,
  CreateUserCommand,
  UpdateUserCommand,
  AssignRolesRequest,
  ChangePasswordRequest,
} from './types';

// ============================================================================
// PAGINACIÓN - TIPOS Y SERVICIO
// ============================================================================

/**
 * Parámetros para consultas paginadas de usuarios
 * Extiende los parámetros base con filtros específicos de usuarios
 */
export interface UserPagedParams extends BasePagedParams {
  roleCode?: string; // Filtrar por código de rol (ADMIN, DOCENTE, etc.)
}

/**
 * Servicio de usuarios con paginación
 * Extiende del servicio base genérico
 */
export class UserService extends BasePagedService<UserDto, UserPagedParams> {
  constructor() {
    super('/api/Users');
  }
}

/**
 * Instancia del servicio de usuarios para uso en la aplicación
 */
export const userService = new UserService();

// ============================================================================
// USERS - GESTIÓN DE USUARIOS
// ============================================================================

/**
 * Obtiene la lista de todos los usuarios
 * GET /api/Users
 *
 * @param activeOnly - Filtrar solo usuarios activos (default: false)
 * @returns Lista de usuarios básicos
 */
export async function getUsers(activeOnly: boolean = false): Promise<UserDto[]> {
  return apiClient.get<UserDto[]>('/api/Users', {
    params: activeOnly ? { activeOnly: true } : undefined,
  });
}

/**
 * Obtiene el detalle completo de un usuario por su ID
 * GET /api/Users/{id}
 *
 * @param id - ID del usuario (UUID)
 * @returns Detalle completo del usuario incluyendo roles y permisos
 */
export async function getUserById(id: string): Promise<UserDetailDto> {
  return apiClient.get<UserDetailDto>(`/api/Users/${id}`);
}

/**
 * Crea un nuevo usuario en el sistema
 * POST /api/Users
 *
 * @param command - Datos del nuevo usuario
 * @returns void (201 Created)
 *
 * @example
 * await createUser({
 *   name: "Juan Pérez",
 *   email: "juan.perez@example.com",
 *   rawPassword: "password123",
 *   roleCodes: ["DOCENTE"],
 *   isActive: true
 * });
 */
export async function createUser(command: CreateUserCommand): Promise<void> {
  return apiClient.post<void>('/api/Users', command);
}

/**
 * Actualiza un usuario existente
 * PUT /api/Users/{id}
 *
 * @param id - ID del usuario a actualizar
 * @param command - Datos actualizados del usuario
 * @returns void (200 OK)
 *
 * @example
 * await updateUser("uuid-123", {
 *   name: "Juan Pérez Actualizado",
 *   email: "juan.nuevo@example.com",
 *   roleCodes: ["DOCENTE", "ADMIN"]
 * });
 */
export async function updateUser(
  id: string,
  command: UpdateUserCommand
): Promise<void> {
  return apiClient.put<void>(`/api/Users/${id}`, command);
}

/**
 * Activa un usuario (habilita su acceso al sistema)
 * POST /api/Users/{id}/activate
 *
 * @param id - ID del usuario a activar
 * @returns void (200 OK)
 */
export async function activateUser(id: string): Promise<void> {
  return apiClient.post<void>(`/api/Users/${id}/activate`);
}

/**
 * Desactiva un usuario (deshabilita su acceso al sistema)
 * POST /api/Users/{id}/deactivate
 *
 * @param id - ID del usuario a desactivar
 * @returns void (200 OK)
 */
export async function deactivateUser(id: string): Promise<void> {
  return apiClient.post<void>(`/api/Users/${id}/deactivate`);
}

// ============================================================================
// ROLES Y PERMISOS
// ============================================================================

/**
 * Asigna roles a un usuario (reemplaza los roles existentes)
 * POST /api/Users/{id}/roles
 *
 * @param id - ID del usuario
 * @param request - Lista de códigos de roles a asignar
 * @returns void (200 OK)
 *
 * @example
 * await assignRoles("uuid-123", {
 *   roleCodes: ["DOCENTE", "ADMIN"]
 * });
 */
export async function assignRoles(
  id: string,
  request: AssignRolesRequest
): Promise<void> {
  return apiClient.post<void>(`/api/Users/${id}/roles`, request);
}

/**
 * Remueve un rol específico de un usuario
 * DELETE /api/Users/{id}/roles/{roleCode}
 *
 * @param id - ID del usuario
 * @param roleCode - Código del rol a remover (ej: "DOCENTE")
 * @returns void (200 OK)
 *
 * @example
 * await removeRole("uuid-123", "ADMIN");
 */
export async function removeRole(id: string, roleCode: string): Promise<void> {
  return apiClient.delete<void>(`/api/Users/${id}/roles/${roleCode}`);
}

/**
 * Obtiene la lista de permisos efectivos de un usuario
 * GET /api/Users/{id}/permissions
 *
 * @param id - ID del usuario
 * @returns Lista de códigos de permisos
 *
 * @example
 * const permissions = await getUserPermissions("uuid-123");
 * // ["READ_USERS", "CREATE_PPA", "EDIT_OWN_PPA", ...]
 */
export async function getUserPermissions(id: string): Promise<string[]> {
  return apiClient.get<string[]>(`/api/Users/${id}/permissions`);
}

// ============================================================================
// CONTRASEÑA
// ============================================================================

/**
 * Cambia la contraseña de un usuario
 * PUT /api/Users/{id}/password
 *
 * @param id - ID del usuario
 * @param request - Nueva contraseña
 * @returns void (200 OK)
 *
 * Nota: Solo ADMIN puede cambiar contraseñas de otros usuarios
 *
 * @example
 * await changeUserPassword("uuid-123", {
 *   newPassword: "newSecurePassword123"
 * });
 */
export async function changeUserPassword(
  id: string,
  request: ChangePasswordRequest
): Promise<void> {
  return apiClient.put<void>(`/api/Users/${id}/password`, request);
}

// ============================================================================
// OBJETO API EXPORTADO
// ============================================================================

/**
 * API de usuarios - Objeto con todas las funciones exportadas
 */
export const usersApi = {
  // Paginación
  service: userService,

  // CRUD básico
  getUsers,
  getUserById,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,

  // Roles y permisos
  assignRoles,
  removeRole,
  getUserPermissions,

  // Contraseña
  changeUserPassword,
};
