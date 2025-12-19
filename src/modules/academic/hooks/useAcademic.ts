/**
 * React Query hooks para el módulo Academic
 * Facilita el uso de las funciones de API con cache automático y revalidación
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AcademicPeriodDto,
  AcademicPeriodDetailDto,
  CreateAcademicPeriodCommand,
  UpdateAcademicPeriodCommand,
  SubjectDto,
  SubjectDetailDto,
  CreateSubjectCommand,
  UpdateSubjectCommand,
} from '../types';
import {
  getAcademicPeriods,
  getActivePeriod,
  getPeriodById,
  createAcademicPeriod,
  updateAcademicPeriod,
  activateAcademicPeriod,
  deactivateAcademicPeriod,
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  activateSubject,
  deactivateSubject,
} from '../api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const academicKeys = {
  all: ['academic'] as const,

  // Periods
  periods: () => [...academicKeys.all, 'periods'] as const,
  periodsList: (filters: Record<string, unknown> = {}) =>
    [...academicKeys.periods(), 'list', filters] as const,
  periodsActive: () => [...academicKeys.periods(), 'active'] as const,
  periodsDetail: () => [...academicKeys.periods(), 'detail'] as const,
  periodDetail: (id: string) => [...academicKeys.periodsDetail(), id] as const,

  // Subjects
  subjects: () => [...academicKeys.all, 'subjects'] as const,
  subjectsList: (filters: Record<string, unknown> = {}) =>
    [...academicKeys.subjects(), 'list', filters] as const,
  subjectsDetail: () => [...academicKeys.subjects(), 'detail'] as const,
  subjectDetail: (id: string) => [...academicKeys.subjectsDetail(), id] as const,
};

// ============================================================================
// QUERIES - ACADEMIC PERIODS
// ============================================================================

/**
 * Hook para obtener todos los períodos académicos
 */
export function useAcademicPeriods(activeOnly: boolean = false) {
  return useQuery({
    queryKey: academicKeys.periodsList({ activeOnly }),
    queryFn: () => getAcademicPeriods(activeOnly),
  });
}

/**
 * Hook para obtener el período académico activo
 */
export function useActivePeriod() {
  return useQuery({
    queryKey: academicKeys.periodsActive(),
    queryFn: () => getActivePeriod(),
  });
}

/**
 * Hook para obtener el detalle de un período académico
 */
export function usePeriodDetail(id: string) {
  return useQuery({
    queryKey: academicKeys.periodDetail(id),
    queryFn: () => getPeriodById(id),
    enabled: !!id,
  });
}

// ============================================================================
// QUERIES - SUBJECTS
// ============================================================================

/**
 * Hook para obtener todas las asignaturas
 */
export function useSubjects(activeOnly: boolean = false) {
  return useQuery({
    queryKey: academicKeys.subjectsList({ activeOnly }),
    queryFn: () => getSubjects(activeOnly),
  });
}

/**
 * Hook para obtener el detalle de una asignatura
 */
export function useSubjectDetail(id: string) {
  return useQuery({
    queryKey: academicKeys.subjectDetail(id),
    queryFn: () => getSubjectById(id),
    enabled: !!id,
  });
}

// ============================================================================
// MUTATIONS - ACADEMIC PERIODS
// ============================================================================

/**
 * Hook para crear un nuevo período académico
 */
export function useCreatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateAcademicPeriodCommand) =>
      createAcademicPeriod(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.periods() });
    },
  });
}

/**
 * Hook para actualizar un período académico
 */
export function useUpdatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: UpdateAcademicPeriodCommand) =>
      updateAcademicPeriod(command),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: academicKeys.periodDetail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: academicKeys.periods() });
    },
  });
}

/**
 * Hook para activar un período académico
 */
export function useActivatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateAcademicPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.periods() });
    },
  });
}

/**
 * Hook para desactivar un período académico
 */
export function useDeactivatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateAcademicPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.periods() });
    },
  });
}

// ============================================================================
// MUTATIONS - SUBJECTS
// ============================================================================

/**
 * Hook para crear una nueva asignatura
 */
export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateSubjectCommand) => createSubject(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.subjects() });
    },
  });
}

/**
 * Hook para actualizar una asignatura
 */
export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: UpdateSubjectCommand) => updateSubject(command),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: academicKeys.subjectDetail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: academicKeys.subjects() });
    },
  });
}

/**
 * Hook para activar una asignatura
 */
export function useActivateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.subjects() });
    },
  });
}

/**
 * Hook para desactivar una asignatura
 */
export function useDeactivateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.subjects() });
    },
  });
}
