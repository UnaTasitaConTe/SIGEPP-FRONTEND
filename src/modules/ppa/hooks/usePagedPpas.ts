/**
 * Hook para manejar PPAs paginados
 * Wrapper específico sobre usePagedData para el módulo de PPAs
 */

import { usePagedData } from '@/hooks/usePagedData';
import { ppaService } from '../api';
import type { PpaPagedParams } from '../api';
import type { PpaSummaryDto } from '../types/ppa.types';

/**
 * Hook para obtener PPAs paginados
 *
 * @param initialParams - Parámetros iniciales de paginación y filtros
 * @returns Estado y métodos para controlar la paginación de PPAs
 *
 * @example
 * // Listado básico de PPAs
 * const { data, loading, setPage, setSearch } = usePagedPpas();
 *
 * @example
 * // Filtrar PPAs de un período y estado específico
 * const { data, loading } = usePagedPpas({
 *   academicPeriodId: 'uuid-periodo',
 *   status: PpaStatus.InProgress,
 *   isActive: true
 * });
 *
 * @example
 * // Filtrar PPAs de un docente responsable
 * const { data, loading } = usePagedPpas({
 *   responsibleTeacherId: 'uuid-docente'
 * });
 */
export const usePagedPpas = (initialParams?: Partial<PpaPagedParams>) => {
  return usePagedData<PpaSummaryDto, PpaPagedParams>(
    ppaService.getPaged.bind(ppaService),
    initialParams
  );
};
