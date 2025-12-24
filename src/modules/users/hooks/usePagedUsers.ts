/**
 * Hook para manejar usuarios paginados
 * Wrapper específico sobre usePagedData para el módulo de usuarios
 */

import { usePagedData } from '@/hooks/usePagedData';
import { userService } from '../api';
import type { UserPagedParams } from '../api';
import type { UserDto } from '../types';

/**
 * Hook para obtener usuarios paginados
 *
 * @param initialParams - Parámetros iniciales de paginación y filtros
 * @returns Estado y métodos para controlar la paginación de usuarios
 *
 * @example
 * // Listado básico de usuarios
 * const { data, loading, setPage, setSearch } = usePagedUsers();
 *
 * @example
 * // Filtrar solo usuarios activos del rol DOCENTE
 * const { data, loading } = usePagedUsers({
 *   isActive: true,
 *   roleCode: 'DOCENTE'
 * });
 */
export const usePagedUsers = (initialParams?: Partial<UserPagedParams>) => {
  return usePagedData<UserDto, UserPagedParams>(
    userService.getPaged.bind(userService),
    initialParams
  );
};
