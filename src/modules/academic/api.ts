/**
 * API del módulo académico
 * Períodos académicos, materias/asignaturas
 * Alineado con la especificación OpenAPI de SIGEPP
 */

import { apiClient } from '@/lib/apiClient';
import { BasePagedService } from '@/services/basePagedService';
import type { BasePagedParams } from '@/types/common';
import type {
  AcademicPeriodDto,
  AcademicPeriodDetailDto,
  CreateAcademicPeriodCommand,
  UpdateAcademicPeriodCommand,
  SubjectDto,
  SubjectDetailDto,
  CreateSubjectCommand,
  UpdateSubjectCommand,
  GroupDto,
} from './types';

// ============================================================================
// PAGINACIÓN - TIPOS Y SERVICIOS
// ============================================================================

/**
 * Parámetros para consultas paginadas de períodos académicos
 * Usa los parámetros base sin filtros adicionales
 */
export interface AcademicPeriodPagedParams extends BasePagedParams {}

/**
 * Parámetros para consultas paginadas de asignaturas
 * Usa los parámetros base sin filtros adicionales
 */
export interface SubjectPagedParams extends BasePagedParams {}

/**
 * Servicio de períodos académicos con paginación
 */
export class AcademicPeriodService extends BasePagedService<
  AcademicPeriodDto,
  AcademicPeriodPagedParams
> {
  constructor() {
    super('/api/AcademicPeriods');
  }
}

/**
 * Servicio de asignaturas con paginación
 */
export class SubjectService extends BasePagedService<SubjectDto, SubjectPagedParams> {
  constructor() {
    super('/api/Subjects');
  }
}

/**
 * Instancias de servicios para uso en la aplicación
 */
export const academicPeriodService = new AcademicPeriodService();
export const subjectService = new SubjectService();

// ============================================================================
// ACADEMIC PERIODS - CONSULTAS
// ============================================================================

/**
 * Obtiene todos los períodos académicos
 * GET /api/AcademicPeriods
 *
 * @param activeOnly - Filtrar solo períodos activos (default: false)
 * @returns Lista de períodos académicos
 */
export async function getAcademicPeriods(
  activeOnly: boolean = false
): Promise<AcademicPeriodDto[]> {
  return apiClient.get<AcademicPeriodDto[]>('/api/AcademicPeriods', {
    params: activeOnly ? { activeOnly: true } : undefined,
  });
}

/**
 * Obtiene el período académico activo
 * GET /api/AcademicPeriods/active
 *
 * Nota: Este endpoint puede no existir en la API actual.
 * Usa getAcademicPeriods(true) como alternativa.
 */
export async function getActivePeriod(): Promise<AcademicPeriodDto | null> {
  try {
    const periods = await getAcademicPeriods(true);
    return periods.length > 0 ? periods[0] : null;
  } catch {
    return null;
  }
}

/**
 * Obtiene el detalle de un período académico por ID
 * GET /api/AcademicPeriods/{id}
 *
 * @param id - ID del período académico (UUID)
 * @returns Detalle completo del período
 */
export async function getPeriodById(id: string): Promise<AcademicPeriodDetailDto> {
  return apiClient.get<AcademicPeriodDetailDto>(`/api/AcademicPeriods/${id}`);
}

// ============================================================================
// ACADEMIC PERIODS - GESTIÓN
// ============================================================================

/**
 * Crea un nuevo período académico
 * POST /api/AcademicPeriods
 *
 * @param command - Datos del nuevo período
 * @returns void (201 Created)
 */
export async function createAcademicPeriod(
  command: CreateAcademicPeriodCommand
): Promise<void> {
  return apiClient.post<void>('/api/AcademicPeriods', command);
}

/**
 * Actualiza un período académico existente
 * PUT /api/AcademicPeriods/{id}
 *
 * @param id - ID del período a actualizar
 * @param command - Datos actualizados del período
 * @returns void (200 OK)
 */
export async function updateAcademicPeriod(
  id: string,
  command: UpdateAcademicPeriodCommand
): Promise<void> {
  return apiClient.put<void>(`/api/AcademicPeriods/${id}`, command);
}

/**
 * Activa un período académico
 * POST /api/AcademicPeriods/{id}/activate
 *
 * @param id - ID del período a activar
 * @returns void (200 OK)
 */
export async function activateAcademicPeriod(id: string): Promise<void> {
  return apiClient.post<void>(`/api/AcademicPeriods/${id}/activate`);
}

/**
 * Desactiva un período académico
 * POST /api/AcademicPeriods/{id}/deactivate
 *
 * @param id - ID del período a desactivar
 * @returns void (200 OK)
 */
export async function deactivateAcademicPeriod(id: string): Promise<void> {
  return apiClient.post<void>(`/api/AcademicPeriods/${id}/deactivate`);
}

// ============================================================================
// SUBJECTS - CONSULTAS
// ============================================================================

/**
 * Obtiene todas las asignaturas/materias
 * GET /api/Subjects
 *
 * @param activeOnly - Filtrar solo asignaturas activas (default: false)
 * @returns Lista de asignaturas
 */
export async function getSubjects(activeOnly: boolean = false): Promise<SubjectDto[]> {
  return apiClient.get<SubjectDto[]>('/api/Subjects', {
    params: activeOnly ? { activeOnly: true } : undefined,
  });
}

/**
 * Obtiene el detalle de una asignatura por ID
 * GET /api/Subjects/{id}
 *
 * @param id - ID de la asignatura (UUID)
 * @returns Detalle completo de la asignatura
 */
export async function getSubjectById(id: string): Promise<SubjectDetailDto> {
  return apiClient.get<SubjectDetailDto>(`/api/Subjects/${id}`);
}

// ============================================================================
// SUBJECTS - GESTIÓN
// ============================================================================

/**
 * Crea una nueva asignatura
 * POST /api/Subjects
 *
 * @param command - Datos de la nueva asignatura
 * @returns void (201 Created)
 */
export async function createSubject(command: CreateSubjectCommand): Promise<void> {
  return apiClient.post<void>('/api/Subjects', command);
}

/**
 * Actualiza una asignatura existente
 * PUT /api/Subjects/{id}
 *
 * @param id - ID de la asignatura a actualizar
 * @param command - Datos actualizados de la asignatura
 * @returns void (200 OK)
 */
export async function updateSubject(
  id: string,
  command: UpdateSubjectCommand
): Promise<void> {
  return apiClient.put<void>(`/api/Subjects/${id}`, command);
}

/**
 * Activa una asignatura
 * POST /api/Subjects/{id}/activate
 *
 * @param id - ID de la asignatura a activar
 * @returns void (200 OK)
 */
export async function activateSubject(id: string): Promise<void> {
  return apiClient.post<void>(`/api/Subjects/${id}/activate`);
}

/**
 * Desactiva una asignatura
 * POST /api/Subjects/{id}/deactivate
 *
 * @param id - ID de la asignatura a desactivar
 * @returns void (200 OK)
 */
export async function deactivateSubject(id: string): Promise<void> {
  return apiClient.post<void>(`/api/Subjects/${id}/deactivate`);
}

// ============================================================================
// GROUPS (LEGACY - Puede no estar en la API actual)
// ============================================================================

/**
 * Obtiene todos los grupos de un período académico
 * GET /api/Groups/by-period/{periodId}
 *
 * Nota: Este endpoint puede estar deprecado.
 */
export async function getGroupsByPeriod(periodId: string): Promise<GroupDto[]> {
  return apiClient.get<GroupDto[]>(`/api/Groups/by-period/${periodId}`);
}

// ============================================================================
// OBJETO API EXPORTADO
// ============================================================================

/**
 * API de módulo académico - Objeto con todas las funciones exportadas
 */
export const academicApi = {
  // Paginación
  academicPeriodService,
  subjectService,

  // Academic Periods
  getAcademicPeriods,
  getActivePeriod,
  getPeriodById,
  createAcademicPeriod,
  updateAcademicPeriod,
  activateAcademicPeriod,
  deactivateAcademicPeriod,

  // Subjects
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  activateSubject,
  deactivateSubject,

  // Groups (legacy)
  getGroupsByPeriod,
};
