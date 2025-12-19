/**
 * Tipos para el módulo académico (Academic Periods y Subjects)
 * Alineados con la especificación OpenAPI de SIGEPP
 */

// ============================================================================
// ACADEMIC PERIODS - DTOs
// ============================================================================

/**
 * DTO básico de período académico para listados
 * GET /api/AcademicPeriods
 */
export interface AcademicPeriodDto {
  id: string;
  code: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
}

/**
 * DTO detallado de período académico
 * GET /api/AcademicPeriods/{id}
 */
export interface AcademicPeriodDetailDto {
  id: string;
  code: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isCurrent?: boolean;
}

// ============================================================================
// ACADEMIC PERIODS - COMMANDS
// ============================================================================

/**
 * Comando para crear un nuevo período académico
 * POST /api/AcademicPeriods
 */
export interface CreateAcademicPeriodCommand {
  code: string; // minLength: 1, maxLength: 20
  name: string; // minLength: 3, maxLength: 200
  startDate?: string | null; // date format
  endDate?: string | null; // date format
}

/**
 * Comando para actualizar un período académico existente
 * PUT /api/AcademicPeriods/{id}
 */
export interface UpdateAcademicPeriodCommand {
  id: string; // UUID
  code: string; // minLength: 1, maxLength: 20
  name: string; // minLength: 3, maxLength: 200
  startDate?: string | null; // date format
  endDate?: string | null; // date format
}

// ============================================================================
// SUBJECTS - DTOs
// ============================================================================

/**
 * DTO básico de asignatura/materia para listados
 * GET /api/Subjects
 */
export interface SubjectDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

/**
 * DTO detallado de asignatura/materia
 * GET /api/Subjects/{id}
 */
export interface SubjectDetailDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SUBJECTS - COMMANDS
// ============================================================================

/**
 * Comando para crear una nueva asignatura
 * POST /api/Subjects
 */
export interface CreateSubjectCommand {
  code: string; // minLength: 1, maxLength: 20
  name: string; // minLength: 3, maxLength: 200
  description?: string | null; // maxLength: 1000
}

/**
 * Comando para actualizar una asignatura existente
 * PUT /api/Subjects/{id}
 */
export interface UpdateSubjectCommand {
  id: string; // UUID
  code: string; // minLength: 1, maxLength: 20
  name: string; // minLength: 3, maxLength: 200
  description?: string | null; // maxLength: 1000
}

// ============================================================================
// GROUPS (LEGACY - Puede no estar en uso actualmente)
// ============================================================================

/**
 * DTO de Grupo
 * Nota: Este tipo puede estar deprecado según la API actual
 */
export interface GroupDto {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  academicPeriodId: string;
}

// ============================================================================
// HELPERS Y UTILIDADES
// ============================================================================

/**
 * Obtiene el color de badge según el estado del período académico
 */
export function getPeriodStatusColor(isActive: boolean): {
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
 * Obtiene el color de badge según el estado de la asignatura
 */
export function getSubjectStatusColor(isActive: boolean): {
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
 * Formatea un rango de fechas para mostrar
 */
export function formatPeriodDateRange(
  startDate?: string | null,
  endDate?: string | null
): string {
  if (!startDate && !endDate) {
    return 'Sin fechas definidas';
  }

  const start = startDate
    ? new Date(startDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '?';

  const end = endDate
    ? new Date(endDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '?';

  return `${start} - ${end}`;
}
