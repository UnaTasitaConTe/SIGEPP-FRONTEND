/**
 * Hook para manejar períodos académicos paginados
 * Wrapper específico sobre usePagedData para períodos académicos
 */

import { usePagedData } from '@/hooks/usePagedData';
import { academicPeriodService } from '../api';
import type { AcademicPeriodPagedParams } from '../api';
import type { AcademicPeriodDto } from '../types';

/**
 * Hook para obtener períodos académicos paginados
 *
 * @param initialParams - Parámetros iniciales de paginación y filtros
 * @returns Estado y métodos para controlar la paginación de períodos académicos
 *
 * @example
 * // Listado básico de períodos académicos
 * const { data, loading, setPage, setSearch } = usePagedAcademicPeriods();
 *
 * @example
 * // Filtrar solo períodos activos
 * const { data, loading } = usePagedAcademicPeriods({
 *   isActive: true
 * });
 */
export const usePagedAcademicPeriods = (
  initialParams?: Partial<AcademicPeriodPagedParams>
) => {
  return usePagedData<AcademicPeriodDto, AcademicPeriodPagedParams>(
    academicPeriodService.getPaged.bind(academicPeriodService),
    initialParams
  );
};
