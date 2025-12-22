/**
 * Tipos para el módulo de PPA (Plan de Preparación Académica)
 * Alineados con la especificación OpenAPI de SIGEPP
 *
 * IMPORTANTE: El backend usa enums numéricos (integer) para Status y AttachmentType,
 * pero este frontend los maneja como strings para mejor DX. La conversión se hace en el apiClient.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Estados posibles de un PPA
 * Backend: integer enum (0=Proposal, 1=InProgress, 2=Completed, 3=Archived)
 * Frontend: usamos strings por conveniencia
 */
export type PpaStatus = 'Proposal' | 'InProgress' | 'Completed' | 'Archived'| 'InContinuing';

/**
 * Mapeo de PpaStatus string (frontend) a number (backend)
 */
export const PpaStatusToNumber: Record<PpaStatus, number> = {
  Proposal: 0,
  InProgress: 1,
  Completed: 2,
  Archived: 3,
  InContinuing : 4
};

/**
 * Mapeo de number (backend) a PpaStatus string (frontend)
 */
export const NumberToPpaStatus: Record<number, PpaStatus> = {
  0: 'Proposal',
  1: 'InProgress',
  2: 'Completed',
  3: 'Archived',
  4 : 'InContinuing'
};

/**
 * Tipos de anexos que se pueden subir a un PPA
 * Backend: integer enum (0-7)
 * Frontend: usamos strings por conveniencia
 */
export type PpaAttachmentType =
  | 'PpaDocument'
  | 'TeacherAuthorization'
  | 'StudentAuthorization'
  | 'SourceCode'
  | 'Presentation'
  | 'Instrument'
  | 'Evidence'
  | 'Other';

/**
 * Mapeo de PpaAttachmentType string (frontend) a number (backend)
 */
export const PpaAttachmentTypeToNumber: Record<PpaAttachmentType, number> = {
  PpaDocument: 0,
  TeacherAuthorization: 1,
  StudentAuthorization: 2,
  SourceCode: 3,
  Presentation: 4,
  Instrument: 5,
  Evidence: 6,
  Other: 7,
};

/**
 * Mapeo de number (backend) a PpaAttachmentType string (frontend)
 */
export const NumberToPpaAttachmentType: Record<number, PpaAttachmentType> = {
  0: 'PpaDocument',
  1: 'TeacherAuthorization',
  2: 'StudentAuthorization',
  3: 'SourceCode',
  4: 'Presentation',
  5: 'Instrument',
  6: 'Evidence',
  7: 'Other',
};

// ============================================================================
// LABELS PARA UI
// ============================================================================

/**
 * Labels en español para los estados de PPA
 */
export const PpaStatusLabels: Record<PpaStatus, string> = {
  Proposal: 'Propuesta',
  InProgress: 'En Progreso',
  Completed: 'Completado',
  Archived: 'Archivado',
  InContinuing : "En continuación"
};

/**
 * Labels en español para los tipos de anexos
 */
export const PpaAttachmentTypeLabels: Record<PpaAttachmentType, string> = {
  PpaDocument: 'Documento PPA',
  TeacherAuthorization: 'Autorización Docente',
  StudentAuthorization: 'Autorización Estudiante',
  SourceCode: 'Código Fuente',
  Presentation: 'Presentación',
  Instrument: 'Instrumentos',
  Evidence: 'Evidencias',
  Other: 'Otro',
};

// ============================================================================
// DTOs - DATA TRANSFER OBJECTS (según OpenAPI)
// ============================================================================

/**
 * DTO básico de PPA para listados
 * GET /api/Ppa/by-teacher, GET /api/Ppa/by-period
 */
export interface PpaDto {
  id: string;
  title: string;
  description?: string | null;
  generalObjective?: string | null;
  specificObjectives?: string | null;
  status: PpaStatus; // Backend: number, convertir si es necesario
  academicPeriodId: string;
  primaryTeacherId: string;
  createdAt: string;
  updatedAt?: string | null;
  teacherPrimaryName? : string
}

/**
 * Detalle de asignación dentro de PpaDetailDto
 */
export interface AssignmentDetail {
  teacherAssignmentId: string;
  teacherId: string;
  teacherName?: string | null;
  subjectId: string;
  subjectCode?: string | null;
  subjectName?: string | null;
}

/**
 * Estudiante dentro de PpaDetailDto
 */
export interface PpaStudent {
  id?: string | null;
  name: string;
}

/**
 * DTO detallado de PPA
 * GET /api/Ppa/{id}
 */
export interface PpaDetailDto {
  id: string;
  title: string;
  description?: string | null;
  generalObjective?: string | null;
  specificObjectives?: string | null;
  status: PpaStatus; // Backend: number
  academicPeriodId: string;
  academicPeriodCode?: string | null;
  primaryTeacherId: string;
  primaryTeacherName?: string | null;
  teacherAssignmentIds: string[]; // IDs de las asignaciones
  assignmentDetails: AssignmentDetail[]; // Detalles completos de las asignaciones
  students: PpaStudent[]; // Lista de estudiantes con id y nombre
  createdAt: string;
  updatedAt?: string | null;
  hasContinuation: boolean;
  isContinuation: boolean;
  continuationOfPpaId?: string | null; // ID del PPA del cual este es continuación
  continuedByPpaId?: string | null; // ID del PPA que continúa este
}

/**
 * DTO de resumen de PPA (incluye metadata adicional)
 * GET /api/Ppa/my
 */
export interface PpaSummaryDto {
  id: string;
  title: string;
  status: PpaStatus;
  academicPeriodId: string;
  academicPeriodCode?: string | null;
  responsibleTeacherId: string;
  responsibleTeacherName?: string | null;
  assignmentsCount: number;
  studentsCount: number;
  isContinuation: boolean;
  hasContinuation: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

/**
 * Tipo para el enum de acciones en el historial
 * Backend: integer enum (0-12)
 */
export type PpaHistoryActionType =
  | 'Created'
  | 'UpdatedTitle'
  | 'ChangedStatus'
  | 'ChangedResponsibleTeacher'
  | 'UpdatedAssignments'
  | 'UpdatedStudents'
  | 'UpdatedContinuationSettings'
  | 'AttachmentAdded'
  | 'AttachmentRemoved'
  | 'ContinuationCreated'
  | 'UpdatedGeneralObjective'
  | 'UpdatedSpecificObjectives'
  | 'UpdatedDescription';

/**
 * DTO de entrada en el historial de un PPA
 * GET /api/Ppa/{id}/history
 */
export interface PpaHistoryDto {
  id: string;
  ppaId: string;
  performedByUserId: string;
  performedByUserName?: string | null;
  performedAt: string;
  actionType: PpaHistoryActionType;
  actionTypeDescription: string;
  oldValue?: string | null;
  newValue?: string | null;
  notes?: string | null;
}

/**
 * DTO de anexo de PPA
 * GET /api/PpaAttachments/by-ppa/{ppaId}
 */
export interface PpaAttachmentDto {
  id: string;
  ppaId: string;
  type: PpaAttachmentType; // Backend: number
  name: string;
  fileKey: string;
  contentType?: string | null;
  uploadedByUserId: string;
  uploadedAt: string;
  isDeleted: boolean;
}

// ============================================================================
// COMMANDS - INPUT PARA CREAR/ACTUALIZAR (según OpenAPI)
// ============================================================================

/**
 * Comando para crear un nuevo PPA
 * POST /api/Ppa
 */
export interface CreatePpaCommand {
  title: string; // minLength: 3, maxLength: 300
  description?: string | null; // maxLength: 3000
  generalObjective?: string | null; // maxLength: 1000
  specificObjectives?: string | null; // maxLength: 2000
  academicPeriodId: string; // UUID
  teacherAssignmentIds: string[]; // minItems: 1
  studentNames?: string[]; // opcional
}

/**
 * Comando para crear un nuevo PPA como ADMIN
 * POST /api/Ppa/admin
 * Permite especificar el docente responsable directamente
 */
export interface CreatePpaAdminCommand {
  title: string; // minLength: 3, maxLength: 300
  description?: string | null; // maxLength: 3000
  generalObjective?: string | null; // maxLength: 1000
  specificObjectives?: string | null; // maxLength: 2000
  academicPeriodId: string; // UUID
  responsibleTeacherId: string; // UUID del docente responsable
  teacherAssignmentIds: string[]; // minItems: 1
  studentNames?: string[]; // opcional
}

/**
 * Comando para actualizar un PPA existente
 * PUT /api/Ppa/{id}
 */
export interface UpdatePpaCommand {
  id: string; // UUID
  title: string; // minLength: 3, maxLength: 300
  description?: string | null; // maxLength: 3000
  generalObjective?: string | null; // maxLength: 1000
  specificObjectives?: string | null; // maxLength: 2000
  newResponsibleTeacherId?: string | null; // UUID
  newTeacherAssignmentIds?: string[] | null;
  newStudents?: PpaStudent[] | null; // Array de objetos con id (opcional) y name
}

/**
 * Comando para actualizar un PPA existente como ADMIN
 * PUT /api/Ppa/admin/{id}
 * Permite control completo sobre el PPA
 */
export interface UpdatePpaAdminCommand {
  id: string; // UUID
  title: string; // minLength: 3, maxLength: 300
  description?: string | null; // maxLength: 3000
  generalObjective?: string | null; // maxLength: 1000
  specificObjectives?: string | null; // maxLength: 2000
  responsibleTeacherId: string; // UUID del docente responsable
  teacherAssignmentIds: string[]; // minItems: 1
  students: PpaStudent[]; // Array de objetos con id (opcional) y name
}

/**
 * Comando para continuar un PPA en un nuevo período
 * POST /api/Ppa/{id}/continue
 */
export interface ContinuePpaCommand {
  sourcePpaId: string; // UUID
  targetAcademicPeriodId: string; // UUID
  newTitle?: string | null; // 3-300 chars si presente
  newResponsibleTeacherId?: string | null; // UUID
  teacherAssignmentIds: string[]; // minItems: 1
  studentNames?: string[];
}

/**
 * Comando para cambiar el estado de un PPA
 * POST /api/Ppa/{id}/status
 */
export interface ChangePpaStatusCommand {
  id: string; // UUID
  newStatus: PpaStatus; // Backend espera number
}

/**
 * Request para agregar un anexo a un PPA
 * POST /api/PpaAttachments/{ppaId}
 */
export interface AddPpaAttachmentRequest {
  type: PpaAttachmentType; // Backend espera number
  name: string; // minLength: 1, maxLength: 300
  fileKey: string; // minLength: 1, maxLength: 500
  contentType?: string | null; // maxLength: 100
}

/**
 * Resultado de subida de archivo a MinIO
 * POST /api/FileStorage/upload
 */
export interface FileUploadResult {
  fileKey: string;
  originalFileName: string;
  contentType: string;
  folder: string;
}

// ============================================================================
// TIPOS AUXILIARES PARA COMPATIBILIDAD CON CÓDIGO EXISTENTE
// ============================================================================

/**
 * Asignación de docente (usado en vistas de UI)
 * Nota: Este no es un DTO directo de la API, se construye en el frontend
 */
export interface TeacherAssignmentDisplay {
  id: string;
  subjectName?: string;
  subjectCode?: string;
  groupName?: string;
  teacherName?: string;
}

/**
 * Input para crear un anexo (alias para compatibilidad)
 * @deprecated Use AddPpaAttachmentRequest
 */
export type CreatePpaAttachmentInput = AddPpaAttachmentRequest;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene el color de badge según el estado del PPA
 */
export function getPpaStatusColor(status: PpaStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Proposal':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      };
    case 'InProgress':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      };
    case 'Completed':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      };
    case 'Archived':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
      };
  }
}

/**
 * Agrupa anexos por tipo
 */
export function groupAttachmentsByType(
  attachments: PpaAttachmentDto[]
): Record<string, PpaAttachmentDto[]> {
  const grouped: Record<string, PpaAttachmentDto[]> = {};

  attachments.forEach((attachment) => {
    const type = String(attachment.type);
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(attachment);
  });

  return grouped;
}
