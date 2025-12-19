/**
 * Módulo Academic - Barrel exports
 * Exporta todos los tipos y funciones del módulo académico
 */

// Types
export type {
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

export {
  getPeriodStatusColor,
  getSubjectStatusColor,
  formatPeriodDateRange,
} from './types';

// API
export {
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

  // API object
  academicApi,
} from './api';

// Hooks
export {
  academicKeys,
  // Period hooks
  useAcademicPeriods,
  useActivePeriod,
  usePeriodDetail,
  useCreatePeriod,
  useUpdatePeriod,
  useActivatePeriod,
  useDeactivatePeriod,
  // Subject hooks
  useSubjects,
  useSubjectDetail,
  useCreateSubject,
  useUpdateSubject,
  useActivateSubject,
  useDeactivateSubject,
} from './hooks/useAcademic';
