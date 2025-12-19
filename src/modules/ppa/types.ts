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
export type PpaStatus = 'Proposal' | 'InProgress' | 'Completed' | 'Archived';

/**
 * Mapeo de PpaStatus string (frontend) a number (backend)
 */
export const PpaStatusToNumber: Record<PpaStatus, number> = {
  Proposal: 0,
  InProgress: 1,
  Completed: 2,
  Archived: 3,
};

/**
 * Mapeo de number (backend) a PpaStatus string (frontend)
 */
export const NumberToPpaStatus: Record<number, PpaStatus> = {
  0: 'Proposal',
  1: 'InProgress',
  2: 'Completed',
  3: 'Archived',
};

/**
 * Tipos de anexos que se pueden subir a un PPA
 * Backend: integer enum (0=PpaDocument, 1=TeacherAuthorization, 2=StudentAuthorization, 3=SourceCode, 4=Presentation, 5=Other)
 * Frontend: usamos strings por conveniencia
 */
export type PpaAttachmentType =
  | 'PpaDocument'
  | 'TeacherAuthorization'
  | 'StudentAuthorization'
  | 'SourceCode'
  | 'Presentation'
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
  Other: 5,
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
  5: 'Other',
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
  createdAt: string;
  updatedAt?: string | null;
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
  primaryTeacherId: string; // UUID
  teacherAssignmentIds: string[]; // minItems: 1
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
