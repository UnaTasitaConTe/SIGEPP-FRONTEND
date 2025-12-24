/**
 * Hook genérico para paginación de datos
 * Proporciona estado y métodos para manejar datos paginados
 * Reutilizable en todos los módulos de SIGEPP
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { BasePagedParams, PagedResult } from '@/types/common';

/**
 * Hook genérico para manejar datos paginados
 *
 * @template T - El tipo de DTO que se retorna (UserDto, PpaDto, etc.)
 * @template TParams - Los parámetros de filtrado específicos del módulo
 *
 * @param fetchFn - Función que obtiene los datos paginados del backend
 * @param initialParams - Parámetros iniciales (página, tamaño, filtros, etc.)
 *
 * @returns Estado y métodos para controlar la paginación
 *
 * @example
 * const { data, loading, setPage, setSearch } = usePagedData(
 *   userService.getPaged.bind(userService),
 *   { page: 1, pageSize: 10 }
 * );
 */
export function usePagedData<T, TParams extends BasePagedParams>(
  fetchFn: (params: TParams) => Promise<PagedResult<T>>,
  initialParams?: Partial<TParams>
) {
  // Estado de los parámetros de paginación
  const [params, setParams] = useState<TParams>({
    page: 1,
    pageSize: 10,
    ...initialParams,
  } as TParams);

  // Estado de los datos
  const [data, setData] = useState<PagedResult<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para almacenar la función de fetch
  const fetchFnRef = useRef(fetchFn);

  // Actualizar la ref cuando cambie la función
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  /**
   * Efecto para cargar datos cuando cambian los parámetros
   */
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFnRef.current(params);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          const errorMessage = err.message ?? 'Error al cargar datos.';
          setError(errorMessage);
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [params]);

  /**
   * Cambia a una página específica
   */
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Establece el término de búsqueda y resetea a la primera página
   */
  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, page: 1, search }));
  }, []);

  /**
   * Establece múltiples filtros y resetea a la primera página
   */
  const setFilters = useCallback((filters: Partial<TParams>) => {
    setParams((prev) => ({ ...prev, page: 1, ...filters }));
  }, []);

  /**
   * Limpia todos los filtros y resetea a la primera página
   */
  const clearFilters = useCallback(() => {
    setParams((prev) => ({ page: 1, pageSize: prev.pageSize } as TParams));
  }, []);

  /**
   * Vuelve a cargar los datos con los parámetros actuales
   */
  const refetch = useCallback(() => {
    // Forzar re-fetch creando un nuevo objeto de params
    setParams((prev) => ({ ...prev }));
  }, []);

  return {
    // Datos
    data,
    loading,
    error,

    // Parámetros actuales
    params,

    // Métodos de control
    setPage,
    setSearch,
    setFilters,
    clearFilters,
    refetch,
  };
}
