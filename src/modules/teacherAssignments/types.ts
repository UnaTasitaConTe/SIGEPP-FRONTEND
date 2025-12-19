/**
 * Tipos para el módulo de TeacherAssignments (Asignaciones Docente-Materia-Período)
 * Alineados con la especificación OpenAPI de SIGEPP
 */

// ============================================================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================================================

/**
 * DTO de asignación de docente
 * Representa la asignación de un docente a una materia en un período académico
 */
export interface TeacherAssignmentDto {
  id: string;
  teacherId: string;
  subjectId: string;
  academicPeriodId: string;
  isActive: boolean;
  teacherName?: string | null;
  subjectCode?: string | null;
  subjectName?: string | null;
  academicPeriodCode?: string | null;
  academicPeriodName?: string | null;
}

// ============================================================================
// COMMANDS - INPUT PARA CREAR/ACTUALIZAR
// ============================================================================

/**
 * Comando para asignar un docente a una materia en un período
 * POST /api/TeacherAssignments
 */
export interface AssignTeacherCommand {
  teacherId: string; // UUID del docente
  subjectId: string; // UUID de la materia
  academicPeriodId: string; // UUID del período académico
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

/**
 * Parámetros para consultar asignaciones por docente
 * GET /api/TeacherAssignments/by-teacher
 */
export interface GetByTeacherParams {
  teacherId: string;
  academicPeriodId: string;
}

/**
 * Parámetros para consultar asignaciones por materia
 * GET /api/TeacherAssignments/by-subject
 */
export interface GetBySubjectParams {
  subjectId: string;
  academicPeriodId: string;
}

/**
 * Parámetros para consultar asignaciones por período
 * GET /api/TeacherAssignments/by-period
 */
export interface GetByPeriodParams {
  academicPeriodId: string;
}

// ============================================================================
// HELPERS Y UTILIDADES
// ============================================================================

/**
 * Obtiene el color de badge según el estado de la asignación
 */
export function getAssignmentStatusColor(isActive: boolean): {
  bg: string;
  text: string;
  border: string;
} {
  return isActive
    ? {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      }
    : {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
      };
}

/**
 * Formatea el nombre completo de una asignación para mostrar
 */
export function formatAssignmentDisplay(assignment: TeacherAssignmentDto): string {
  const parts: string[] = [];

  if (assignment.teacherName) {
    parts.push(assignment.teacherName);
  }

  if (assignment.subjectCode || assignment.subjectName) {
    const subject = assignment.subjectCode
      ? `${assignment.subjectCode} - ${assignment.subjectName || ''}`
      : assignment.subjectName;
    parts.push(subject || '');
  }

  if (assignment.academicPeriodName) {
    parts.push(`(${assignment.academicPeriodName})`);
  }

  return parts.filter(Boolean).join(' | ');
}

/**
 * Agrupa asignaciones por docente
 */
export function groupAssignmentsByTeacher(
  assignments: TeacherAssignmentDto[]
): Record<string, TeacherAssignmentDto[]> {
  const grouped: Record<string, TeacherAssignmentDto[]> = {};

  assignments.forEach((assignment) => {
    const teacherId = assignment.teacherId;
    if (!grouped[teacherId]) {
      grouped[teacherId] = [];
    }
    grouped[teacherId].push(assignment);
  });

  return grouped;
}

/**
 * Agrupa asignaciones por materia
 */
export function groupAssignmentsBySubject(
  assignments: TeacherAssignmentDto[]
): Record<string, TeacherAssignmentDto[]> {
  const grouped: Record<string, TeacherAssignmentDto[]> = {};

  assignments.forEach((assignment) => {
    const subjectId = assignment.subjectId;
    if (!grouped[subjectId]) {
      grouped[subjectId] = [];
    }
    grouped[subjectId].push(assignment);
  });

  return grouped;
}
