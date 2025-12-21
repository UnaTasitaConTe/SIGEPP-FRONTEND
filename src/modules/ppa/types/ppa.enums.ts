// Generated from backend enums - DO NOT MODIFY MANUALLY
// Source: Domain\Ppa\PpaStatus.cs, PpaHistoryActionType.cs, PpaAttachmentType.cs

export enum PpaStatus {
  Proposal = 0,      // Propuesta inicial
  InProgress = 1,    // En desarrollo activo
  Completed = 2,     // Finalizado
  Archived = 3       // Archivado (estado terminal)
}

export const PpaStatusLabels: Record<PpaStatus, string> = {
  [PpaStatus.Proposal]: 'Propuesta',
  [PpaStatus.InProgress]: 'En Progreso',
  [PpaStatus.Completed]: 'Completado',
  [PpaStatus.Archived]: 'Archivado'
};

export const PpaStatusColors: Record<PpaStatus, string> = {
  [PpaStatus.Proposal]: 'bg-[#9c0f06] text-white',      // Rojo oscuro
  [PpaStatus.InProgress]: 'bg-[#e30513] text-white',     // Rojo principal
  [PpaStatus.Completed]: 'bg-[#3c3c3b] text-white',      // Gris oscuro
  [PpaStatus.Archived]: 'bg-[#630b00] text-white'        // Vino/marrón
};

export enum PpaHistoryActionType {
  Created = 0,
  UpdatedTitle = 1,
  ChangedStatus = 2,
  ChangedResponsibleTeacher = 3,
  UpdatedAssignments = 4,
  UpdatedStudents = 5,
  UpdatedContinuationSettings = 6,
  AttachmentAdded = 7,
  AttachmentRemoved = 8,
  ContinuationCreated = 9,
  UpdatedGeneralObjective = 10,
  UpdatedSpecificObjectives = 11,
  UpdatedDescription = 12
}

export const PpaHistoryActionLabels: Record<PpaHistoryActionType, string> = {
  [PpaHistoryActionType.Created]: 'Creación',
  [PpaHistoryActionType.UpdatedTitle]: 'Actualización de título',
  [PpaHistoryActionType.ChangedStatus]: 'Cambio de estado',
  [PpaHistoryActionType.ChangedResponsibleTeacher]: 'Cambio de responsable',
  [PpaHistoryActionType.UpdatedAssignments]: 'Actualización de asignaciones',
  [PpaHistoryActionType.UpdatedStudents]: 'Actualización de estudiantes',
  [PpaHistoryActionType.UpdatedContinuationSettings]: 'Actualización de configuración de continuación',
  [PpaHistoryActionType.AttachmentAdded]: 'Anexo agregado',
  [PpaHistoryActionType.AttachmentRemoved]: 'Anexo eliminado',
  [PpaHistoryActionType.ContinuationCreated]: 'Continuación creada',
  [PpaHistoryActionType.UpdatedGeneralObjective]: 'Actualización de objetivo general',
  [PpaHistoryActionType.UpdatedSpecificObjectives]: 'Actualización de objetivos específicos',
  [PpaHistoryActionType.UpdatedDescription]: 'Actualización de descripción'
};

export enum PpaAttachmentType {
  PpaDocument = 0,           // Documento formal del PPA (requerido para Completed)
  TeacherAuthorization = 1,  // Autorización del docente
  StudentAuthorization = 2,  // Autorización de estudiantes
  SourceCode = 3,            // Código fuente (ZIP, repo, etc.)
  Presentation = 4,          // Presentación (diapositivas, video)
  Instrument = 5,            // Instrumentos de investigación
  Evidence = 6,              // Evidencias del desarrollo
  Other = 7                  // Otros anexos
}

export const PpaAttachmentTypeLabels: Record<PpaAttachmentType, string> = {
  [PpaAttachmentType.PpaDocument]: 'Documento PPA',
  [PpaAttachmentType.TeacherAuthorization]: 'Autorización Docente',
  [PpaAttachmentType.StudentAuthorization]: 'Autorización Estudiantes',
  [PpaAttachmentType.SourceCode]: 'Código Fuente',
  [PpaAttachmentType.Presentation]: 'Presentación',
  [PpaAttachmentType.Instrument]: 'Instrumentos',
  [PpaAttachmentType.Evidence]: 'Evidencias',
  [PpaAttachmentType.Other]: 'Otros'
};

export const PpaAttachmentTypeDescriptions: Record<PpaAttachmentType, string> = {
  [PpaAttachmentType.PpaDocument]: 'Documento formal del PPA',
  [PpaAttachmentType.TeacherAuthorization]: 'Documento de autorización firmado por el docente',
  [PpaAttachmentType.StudentAuthorization]: 'Documentos de autorización de estudiantes participantes',
  [PpaAttachmentType.SourceCode]: 'Código fuente del proyecto (ZIP, repositorio, etc.)',
  [PpaAttachmentType.Presentation]: 'Presentaciones, diapositivas o videos',
  [PpaAttachmentType.Instrument]: 'Instrumentos de investigación utilizados',
  [PpaAttachmentType.Evidence]: 'Evidencias del desarrollo del proyecto',
  [PpaAttachmentType.Other]: 'Otros documentos relacionados'
};
