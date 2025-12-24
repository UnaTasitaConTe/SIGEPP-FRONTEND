/**
 * Hook para manejar asignaturas/materias paginadas
 * Wrapper específico sobre usePagedData para asignaturas
 */

import { usePagedData } from '@/hooks/usePagedData';
import { subjectService } from '../api';
import type { SubjectPagedParams } from '../api';
import type { SubjectDto } from '../types';

/**
 * Hook para obtener asignaturas paginadas
 *
 * @param initialParams - Parámetros iniciales de paginación y filtros
 * @returns Estado y métodos para controlar la paginación de asignaturas
 *
 * @example
 * // Listado básico de asignaturas
 * const { data, loading, setPage, setSearch } = usePagedSubjects();
 *
 * @example
 * // Filtrar solo asignaturas activas
 * const { data, loading } = usePagedSubjects({
 *   isActive: true
 * });
 */
export const usePagedSubjects = (initialParams?: Partial<SubjectPagedParams>) => {
  return usePagedData<SubjectDto, SubjectPagedParams>(
    subjectService.getPaged.bind(subjectService),
    initialParams
  );
};
