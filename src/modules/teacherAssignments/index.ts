/**
 * Módulo TeacherAssignments - Barrel exports
 * Exporta todos los tipos y funciones del módulo de asignaciones docente-materia-período
 */

// Types
export type {
  TeacherAssignmentDto,
  AssignTeacherCommand,
  GetByTeacherParams,
  GetBySubjectParams,
  GetByPeriodParams,
} from './types';

export {
  getAssignmentStatusColor,
  formatAssignmentDisplay,
  groupAssignmentsByTeacher,
  groupAssignmentsBySubject,
} from './types';

// API
export {
  getAssignmentsByTeacher,
  getAssignmentsBySubject,
  getAssignmentsByPeriod,
  assignTeacher,
  activateAssignment,
  deactivateAssignment,
  deleteAssignment,
  teacherAssignmentsApi,
} from './api';

// Hooks
export {
  useAssignmentsByTeacher,
  useAssignmentsBySubject,
  useAssignmentsByPeriod,
  useAssignTeacher,
  useActivateAssignment,
  useDeactivateAssignment,
  useDeleteAssignment,
  teacherAssignmentsKeys,
} from './hooks/useTeacherAssignments';
