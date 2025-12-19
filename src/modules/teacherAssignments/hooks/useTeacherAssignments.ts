/**
 * Hook useTeacherAssignments - Facilita el uso de React Query para asignaciones docente-materia
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAssignmentsByTeacher,
  getAssignmentsBySubject,
  getAssignmentsByPeriod,
  assignTeacher,
  activateAssignment,
  deactivateAssignment,
  deleteAssignment,
} from '../api';
import type {
  AssignTeacherCommand,
  GetByTeacherParams,
  GetBySubjectParams,
  GetByPeriodParams,
} from '../types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const teacherAssignmentsKeys = {
  all: ['teacherAssignments'] as const,
  byTeacher: (params: GetByTeacherParams) =>
    [...teacherAssignmentsKeys.all, 'by-teacher', params] as const,
  bySubject: (params: GetBySubjectParams) =>
    [...teacherAssignmentsKeys.all, 'by-subject', params] as const,
  byPeriod: (params: GetByPeriodParams) =>
    [...teacherAssignmentsKeys.all, 'by-period', params] as const,
};

// ============================================================================
// QUERIES (READ)
// ============================================================================

/**
 * Hook para obtener las asignaciones de un docente en un período
 * @param params - teacherId y academicPeriodId
 */
export function useAssignmentsByTeacher(params: GetByTeacherParams | undefined) {
  return useQuery({
    queryKey: teacherAssignmentsKeys.byTeacher(params!),
    queryFn: () => getAssignmentsByTeacher(params!),
    enabled: !!params?.teacherId && !!params?.academicPeriodId,
  });
}

/**
 * Hook para obtener las asignaciones de una materia en un período
 * @param params - subjectId y academicPeriodId
 */
export function useAssignmentsBySubject(params: GetBySubjectParams | undefined) {
  return useQuery({
    queryKey: teacherAssignmentsKeys.bySubject(params!),
    queryFn: () => getAssignmentsBySubject(params!),
    enabled: !!params?.subjectId && !!params?.academicPeriodId,
  });
}

/**
 * Hook para obtener todas las asignaciones de un período académico
 * @param params - academicPeriodId
 */
export function useAssignmentsByPeriod(params: GetByPeriodParams | undefined) {
  return useQuery({
    queryKey: teacherAssignmentsKeys.byPeriod(params!),
    queryFn: () => getAssignmentsByPeriod(params!),
    enabled: !!params?.academicPeriodId,
  });
}

// ============================================================================
// MUTATIONS (CREATE/UPDATE/DELETE)
// ============================================================================

/**
 * Hook para asignar un docente a una materia
 */
export function useAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: AssignTeacherCommand) => assignTeacher(command),
    onSuccess: () => {
      // Invalidar todas las queries de asignaciones para refrescar
      queryClient.invalidateQueries({ queryKey: teacherAssignmentsKeys.all });
    },
  });
}

/**
 * Hook para activar una asignación
 */
export function useActivateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherAssignmentsKeys.all });
    },
  });
}

/**
 * Hook para desactivar una asignación
 */
export function useDeactivateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherAssignmentsKeys.all });
    },
  });
}

/**
 * Hook para eliminar permanentemente una asignación
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherAssignmentsKeys.all });
    },
  });
}
