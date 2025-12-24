/**
 * Hook para manejar asignaciones docente-materia paginadas
 * Wrapper específico sobre usePagedData para asignaciones
 */

import { usePagedData } from '@/hooks/usePagedData';
import { teacherAssignmentService } from '../api';
import type { TeacherAssignmentPagedParams } from '../api';
import type { TeacherAssignmentDto } from '../types';

/**
 * Hook para obtener asignaciones docente-materia paginadas
 *
 * @param initialParams - Parámetros iniciales de paginación y filtros
 * @returns Estado y métodos para controlar la paginación de asignaciones
 *
 * @example
 * // Listado básico de asignaciones
 * const { data, loading, setPage, setSearch } = usePagedTeacherAssignments();
 *
 * @example
 * // Filtrar asignaciones de un período y docente específico
 * const { data, loading } = usePagedTeacherAssignments({
 *   academicPeriodId: 'uuid-periodo',
 *   teacherId: 'uuid-docente',
 *   isActive: true
 * });
 */
export const usePagedTeacherAssignments = (
  initialParams?: Partial<TeacherAssignmentPagedParams>
) => {
  return usePagedData<TeacherAssignmentDto, TeacherAssignmentPagedParams>(
    teacherAssignmentService.getPaged.bind(teacherAssignmentService),
    initialParams
  );
};
