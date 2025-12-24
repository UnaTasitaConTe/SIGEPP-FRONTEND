// Generated from OpenAPI spec - align with DocumentacionApi/openapi.Ppa.json
import { PpaHistoryActionType as PpaHistoryActionTypeEnum, PpaAttachmentType as PpaAttachmentTypeEnum } from './ppa.enums';

// Import types from the main types file (string literal unions)
import type { PpaStatus, PpaHistoryActionType, PpaAttachmentType } from '../types';

// ============================================================================
// RESPONSE DTOs
// ============================================================================

export interface AssignmentDetail {
  teacherAssignmentId: string;
  teacherId: string;
  teacherName: string | null;
  subjectId: string;
  subjectCode: string | null;
  subjectName: string | null;
}

export interface PpaStudent {
  id?: string | null;
  name: string;
}

export interface PpaDetailDto {
  id: string;
  title: string;
  description: string | null;
  generalObjective: string | null;
  specificObjectives: string | null;
  status: PpaStatus;
  academicPeriodId: string;
  academicPeriodCode: string | null;
  primaryTeacherId: string;
  primaryTeacherName: string | null;
  teacherAssignmentIds: string[];
  assignmentDetails: AssignmentDetail[]; // Detalles completos de las asignaciones
  students: PpaStudent[]; // Lista de estudiantes con id y nombre
  createdAt: string;
  updatedAt: string | null;
}

export interface PpaDto {
  id: string;
  title: string;
  description: string | null;
  generalObjective: string | null;
  specificObjectives: string | null;
  status: PpaStatus;
  academicPeriodId: string;
  primaryTeacherId: string;
  createdAt: string;
  updatedAt: string | null;
  teacherPrimaryName: string | null;
}

export interface PpaSummaryDto {
  id: string;
  title: string;
  status: PpaStatus;
  academicPeriodId: string;
  academicPeriodCode: string | null;
  responsibleTeacherId: string;
  responsibleTeacherName: string | null;
  assignmentsCount: number;
  studentsCount: number;
  isContinuation: boolean;
  hasContinuation: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PpaHistoryDto {
  id: string;
  ppaId: string;
  performedByUserId: string;
  performedByUserName: string | null;
  performedAt: string;
  actionType: PpaHistoryActionType;
  actionTypeDescription: string;
  oldValue: string | null;
  newValue: string | null;
  notes: string | null;
}

export interface PpaAttachmentDto {
  id: string;
  ppaId: string;
  type: PpaAttachmentType;
  name: string;
  fileKey: string;
  contentType: string | null;
  uploadedByUserId: string;
  uploadedAt: string;
  isDeleted: boolean; // Backend filtra automáticamente, siempre false en responses
}

// ============================================================================
// REQUEST DTOs (Commands)
// ============================================================================

export interface CreatePpaCommand {
  title: string;                    // required, 3-300 chars
  description?: string | null;      // 0-3000 chars
  generalObjective?: string | null; // 0-1000 chars
  specificObjectives?: string | null; // 0-2000 chars
  academicPeriodId: string;         // required, UUID
  teacherAssignmentIds: string[];   // required, minItems: 1, UUIDs
  studentNames?: string[];          // optional
}

export interface UpdatePpaCommand {
  id: string;                           // required, UUID
  title: string;                        // required, 3-300 chars
  description?: string | null;          // 0-3000 chars
  generalObjective?: string | null;     // 0-1000 chars
  specificObjectives?: string | null;   // 0-2000 chars
  newResponsibleTeacherId?: string | null; // UUID
  newTeacherAssignmentIds?: string[] | null; // UUIDs
  newStudents?: PpaStudent[] | null;    // array de objetos con id (opcional) y name
}

export interface ChangePpaStatusCommand {
  id: string;           // required, UUID
  newStatus: PpaStatus; // required, 0-3
}

export interface ContinuePpaCommand {
  sourcePpaId: string;              // required, UUID
  targetAcademicPeriodId: string;   // required, UUID
  newTitle?: string | null;         // 3-300 chars si presente
  newResponsibleTeacherId?: string | null; // UUID
  teacherAssignmentIds: string[];   // required, minItems: 1
  studentNames?: string[];          // optional
}

export interface AddPpaAttachmentRequest {
  type: PpaAttachmentType;  // required, 0-7
  name: string;             // required, 1-300 chars
  fileKey: string;          // required, 1-500 chars
  contentType?: string | null; // 0-100 chars
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface CreatePpaResponse {
  id: string;
  message: string;
}

export interface CreateAttachmentResponse {
  id: string;
  message: string;
}
