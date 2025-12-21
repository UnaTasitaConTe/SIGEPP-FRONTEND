// Zod validation schemas - align with backend validations
import { z } from 'zod';

// ============================================================================
// PPA SCHEMAS
// ============================================================================

export const createPpaSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(300, 'El título no puede superar los 300 caracteres'),

  description: z
    .string()
    .max(3000, 'La descripción no puede superar los 3000 caracteres')
    .nullable()
    .optional(),

  generalObjective: z
    .string()
    .max(1000, 'El objetivo general no puede superar los 1000 caracteres')
    .nullable()
    .optional(),

  specificObjectives: z
    .string()
    .max(2000, 'Los objetivos específicos no pueden superar los 2000 caracteres')
    .nullable()
    .optional(),

  academicPeriodId: z
    .string()
    .uuid('Debe seleccionar un período académico válido'),

  teacherAssignmentIds: z
    .array(z.string().uuid())
    .min(1, 'Debe seleccionar al menos una asignación docente'),

  studentNames: z
    .array(z.string())
    .optional()
});

export const ppaStudentSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'El nombre del estudiante es requerido')
});

export const updatePpaSchema = z.object({
  id: z.string().uuid(),

  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(300, 'El título no puede superar los 300 caracteres'),

  description: z
    .string()
    .max(3000, 'La descripción no puede superar los 3000 caracteres')
    .nullable()
    .optional(),

  generalObjective: z
    .string()
    .max(1000, 'El objetivo general no puede superar los 1000 caracteres')
    .nullable()
    .optional(),

  specificObjectives: z
    .string()
    .max(2000, 'Los objetivos específicos no pueden superar los 2000 caracteres')
    .nullable()
    .optional(),

  newResponsibleTeacherId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  newTeacherAssignmentIds: z
    .array(z.string().uuid())
    .nullable()
    .optional(),

  newStudents: z
    .array(ppaStudentSchema)
    .nullable()
    .optional()
});

export const continuePpaSchema = z.object({
  sourcePpaId: z
    .string()
    .uuid('PPA origen inválido'),

  targetAcademicPeriodId: z
    .string()
    .uuid('Debe seleccionar un período académico válido'),

  newTitle: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(300, 'El título no puede superar los 300 caracteres')
    .nullable()
    .optional(),

  newResponsibleTeacherId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  teacherAssignmentIds: z
    .array(z.string().uuid())
    .min(1, 'Debe seleccionar al menos una asignación docente'),

  studentNames: z
    .array(z.string())
    .optional()
});

// ============================================================================
// ATTACHMENT SCHEMAS
// ============================================================================

export const addAttachmentSchema = z.object({
  type: z
    .number()
    .min(0, 'Tipo de anexo inválido')
    .max(7, 'Tipo de anexo inválido'),

  name: z
    .string()
    .min(1, 'El nombre del archivo es requerido')
    .max(300, 'El nombre no puede superar los 300 caracteres'),

  fileKey: z
    .string()
    .min(1, 'La clave del archivo es requerida')
    .max(500, 'La clave del archivo es demasiado larga'),

  contentType: z
    .string()
    .max(100, 'El tipo de contenido es demasiado largo')
    .nullable()
    .optional()
});

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/msword', // .doc
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-powerpoint', // .ppt
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain'
  ] as const
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo' };
  }

  if (file.size > FILE_UPLOAD_CONFIG.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `El archivo supera el límite de ${FILE_UPLOAD_CONFIG.MAX_SIZE_MB}MB`
    };
  }

  if (!FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Formatos aceptados: PDF, Word, Excel, PowerPoint, imágenes, ZIP'
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreatePpaFormData = z.infer<typeof createPpaSchema>;
export type UpdatePpaFormData = z.infer<typeof updatePpaSchema>;
export type ContinuePpaFormData = z.infer<typeof continuePpaSchema>;
export type AddAttachmentFormData = z.infer<typeof addAttachmentSchema>;
