/**
 * API de TeacherAssignments - Funciones para gestión de asignaciones docente-materia-período
 * Alineado con la especificación OpenAPI de SIGEPP
 */

import { apiClient } from '@/lib/apiClient';
import { BasePagedService } from '@/services/basePagedService';
import type { BasePagedParams } from '@/types/common';
import type {
  TeacherAssignmentDto,
  AssignTeacherCommand,
  GetByTeacherParams,
  GetBySubjectParams,
  GetByPeriodParams,
} from './types';

// ============================================================================
// PAGINACIÓN - TIPOS Y SERVICIO
// ============================================================================

/**
 * Parámetros para consultas paginadas de asignaciones docente-materia
 * Extiende los parámetros base con filtros específicos
 */
export interface TeacherAssignmentPagedParams extends BasePagedParams {
  academicPeriodId?: string; // Filtrar por período académico
  teacherId?: string;        // Filtrar por docente
  subjectId?: string;        // Filtrar por materia
}

/**
 * Servicio de asignaciones docente-materia con paginación
 */
export class TeacherAssignmentService extends BasePagedService<
  TeacherAssignmentDto,
  TeacherAssignmentPagedParams
> {
  constructor() {
    super('/api/TeacherAssignments');
  }
}

/**
 * Instancia del servicio para uso en la aplicación
 */
export const teacherAssignmentService = new TeacherAssignmentService();

// ============================================================================
// TEACHER ASSIGNMENTS - CONSULTAS
// ============================================================================

/**
 * Obtiene las asignaciones de un docente en un período académico específico
 * GET /api/TeacherAssignments/by-teacher
 *
 * @param params - Parámetros con teacherId y academicPeriodId
 * @returns Lista de asignaciones del docente
 *
 * @example
 * const assignments = await getAssignmentsByTeacher({
 *   teacherId: "uuid-123",
 *   academicPeriodId: "uuid-456"
 * });
 */
export async function getAssignmentsByTeacher(
  params: GetByTeacherParams
): Promise<TeacherAssignmentDto[]> {
  return apiClient.get<TeacherAssignmentDto[]>(
    '/api/TeacherAssignments/by-teacher',
    {
      params: {
        teacherId: params.teacherId,
        academicPeriodId: params.academicPeriodId,
      },
    }
  );
}

/**
 * Obtiene las asignaciones de una materia en un período académico específico
 * GET /api/TeacherAssignments/by-subject
 *
 * @param params - Parámetros con subjectId y academicPeriodId
 * @returns Lista de asignaciones de la materia (qué docentes la imparten)
 *
 * @example
 * const assignments = await getAssignmentsBySubject({
 *   subjectId: "uuid-123",
 *   academicPeriodId: "uuid-456"
 * });
 */
export async function getAssignmentsBySubject(
  params: GetBySubjectParams
): Promise<TeacherAssignmentDto[]> {
  return apiClient.get<TeacherAssignmentDto[]>(
    '/api/TeacherAssignments/by-subject',
    {
      params: {
        subjectId: params.subjectId,
        academicPeriodId: params.academicPeriodId,
      },
    }
  );
}

/**
 * Obtiene todas las asignaciones de un período académico
 * GET /api/TeacherAssignments/by-period
 *
 * @param params - Parámetros con academicPeriodId
 * @returns Lista de todas las asignaciones del período
 *
 * @example
 * const assignments = await getAssignmentsByPeriod({
 *   academicPeriodId: "uuid-456"
 * });
 */
export async function getAssignmentsByPeriod(
  params: GetByPeriodParams
): Promise<TeacherAssignmentDto[]> {
  return apiClient.get<TeacherAssignmentDto[]>(
    '/api/TeacherAssignments/by-period',
    {
      params: {
        academicPeriodId: params.academicPeriodId,
      },
    }
  );
}

// ============================================================================
// TEACHER ASSIGNMENTS - GESTIÓN
// ============================================================================

/**
 * Asigna un docente a una materia en un período académico
 * POST /api/TeacherAssignments
 *
 * @param command - Datos de la asignación (teacherId, subjectId, academicPeriodId)
 * @returns void (201 Created)
 *
 * @example
 * await assignTeacher({
 *   teacherId: "uuid-docente",
 *   subjectId: "uuid-materia",
 *   academicPeriodId: "uuid-periodo"
 * });
 */
export async function assignTeacher(
  command: AssignTeacherCommand
): Promise<void> {
  return apiClient.post<void>('/api/TeacherAssignments', command);
}

/**
 * Activa una asignación existente
 * POST /api/TeacherAssignments/{id}/activate
 *
 * @param id - ID de la asignación a activar
 * @returns void (200 OK)
 */
export async function activateAssignment(id: string): Promise<void> {
  return apiClient.post<void>(`/api/TeacherAssignments/${id}/activate`);
}

/**
 * Desactiva una asignación existente
 * POST /api/TeacherAssignments/{id}/deactivate
 *
 * @param id - ID de la asignación a desactivar
 * @returns void (200 OK)
 */
export async function deactivateAssignment(id: string): Promise<void> {
  return apiClient.post<void>(`/api/TeacherAssignments/${id}/deactivate`);
}

/**
 * Elimina permanentemente una asignación
 * DELETE /api/TeacherAssignments/{id}
 *
 * @param id - ID de la asignación a eliminar
 * @returns void (200 OK)
 *
 * Nota: Usar con precaución. Esto elimina permanentemente la asignación.
 * Considera usar deactivateAssignment() en su lugar para mantener el historial.
 */
export async function deleteAssignment(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/TeacherAssignments/${id}`);
}

// ============================================================================
// OBJETO API EXPORTADO
// ============================================================================

/**
 * API de asignaciones docente-materia - Objeto con todas las funciones exportadas
 */
export const teacherAssignmentsApi = {
  // Paginación
  service: teacherAssignmentService,

  // Consultas
  getAssignmentsByTeacher,
  getAssignmentsBySubject,
  getAssignmentsByPeriod,

  // Gestión
  assignTeacher,
  activateAssignment,
  deactivateAssignment,
  deleteAssignment,
};
