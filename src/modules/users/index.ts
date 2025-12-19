/**
 * Módulo Users - Barrel exports
 * Exporta todos los tipos y funciones del módulo de usuarios
 */

// Types
export type {
  UserDto,
  UserDetailDto,
  UserRoleDto,
  CreateUserCommand,
  UpdateUserCommand,
  AssignRolesRequest,
  ChangePasswordRequest,
} from './types';

export {
  UserRole,
  UserRoleLabels,
  UserRoleDescriptions,
  getUserStatusColor,
  getRoleBadgeColor,
} from './types';

// API
export {
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
  usersApi,
} from './api';

// Hooks
export {
  useUsers,
  useUser,
  useUserPermissions,
  useCreateUser,
  useUpdateUser,
  useActivateUser,
  useDeactivateUser,
  useAssignRoles,
  useRemoveRole,
  useChangeUserPassword,
  usersKeys,
} from './hooks/useUsers';
