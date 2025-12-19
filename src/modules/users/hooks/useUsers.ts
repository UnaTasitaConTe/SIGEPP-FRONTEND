/**
 * Hook useUsers - Facilita el uso de React Query para gestión de usuarios
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  assignRoles,
  removeRole,
  getUserPermissions,
  changeUserPassword,
} from '../api';
import type {
  CreateUserCommand,
  UpdateUserCommand,
  AssignRolesRequest,
  ChangePasswordRequest,
} from '../types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: { activeOnly?: boolean }) =>
    [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  permissions: (id: string) => [...usersKeys.detail(id), 'permissions'] as const,
};

// ============================================================================
// QUERIES (READ)
// ============================================================================

/**
 * Hook para obtener la lista de usuarios
 * @param activeOnly - Filtrar solo usuarios activos
 */
export function useUsers(activeOnly: boolean = false) {
  return useQuery({
    queryKey: usersKeys.list({ activeOnly }),
    queryFn: () => getUsers(activeOnly),
  });
}

/**
 * Hook para obtener el detalle de un usuario específico
 * @param id - ID del usuario
 */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(id!),
    queryFn: () => getUserById(id!),
    enabled: !!id,
  });
}

/**
 * Hook para obtener los permisos de un usuario
 * @param id - ID del usuario
 */
export function useUserPermissions(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.permissions(id!),
    queryFn: () => getUserPermissions(id!),
    enabled: !!id,
  });
}

// ============================================================================
// MUTATIONS (CREATE/UPDATE/DELETE)
// ============================================================================

/**
 * Hook para crear un nuevo usuario
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateUserCommand) => createUser(command),
    onSuccess: () => {
      // Invalidar la lista de usuarios para refrescar
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un usuario existente
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateUserCommand }) =>
      updateUser(id, command),
    onSuccess: (_, variables) => {
      // Invalidar el detalle del usuario actualizado
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) });
      // Invalidar la lista de usuarios
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/**
 * Hook para activar un usuario
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/**
 * Hook para desactivar un usuario
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/**
 * Hook para asignar roles a un usuario
 */
export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: AssignRolesRequest }) =>
      assignRoles(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.permissions(variables.id) });
    },
  });
}

/**
 * Hook para remover un rol de un usuario
 */
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roleCode }: { id: string; roleCode: string }) =>
      removeRole(id, roleCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.permissions(variables.id) });
    },
  });
}

/**
 * Hook para cambiar la contraseña de un usuario
 */
export function useChangeUserPassword() {
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ChangePasswordRequest }) =>
      changeUserPassword(id, request),
  });
}
