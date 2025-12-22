/**
 * API de PPA - Funciones para interactuar con el backend de PPAs
 * Usa el apiClient refactorizado con principios SOLID
 */

import { apiClient } from '@/lib/apiClient';
import type {
  PpaDto,
  PpaDetailDto,
  PpaSummaryDto,
  PpaHistoryDto,
  PpaAttachmentDto,
  AddPpaAttachmentRequest,
  FileUploadResult,
  CreatePpaCommand,
  CreatePpaAdminCommand,
  UpdatePpaCommand,
  UpdatePpaAdminCommand,
  ChangePpaStatusCommand,
  ContinuePpaCommand,
  PpaAttachmentType,
} from './types';
import {
  PpaStatusToNumber,
  NumberToPpaStatus,
  PpaAttachmentTypeToNumber,
  NumberToPpaAttachmentType,
} from './types';

// ============================================================================
// PPA ENDPOINTS
// ============================================================================

/**
 * Obtiene los PPAs de un docente para un período académico específico
 * GET /api/Ppa/by-teacher?teacherId={teacherId}&academicPeriodId={academicPeriodId}
 */
export async function getPpasByTeacher(
  teacherId: string,
  academicPeriodId: string
): Promise<PpaDto[]> {
  const response = await apiClient.get<any[]>('/api/Ppa/by-teacher', {
    params: {
      teacherId,
      academicPeriodId,
    },
  });

  // Convertir status de number a string
  return response.map((ppa) => ({
    ...ppa,
    status: NumberToPpaStatus[ppa.status] || 'Proposal',
  }));
}

/**
 * Obtiene el detalle completo de un PPA por su ID
 * GET /api/Ppa/{id}
 */
export async function getPpaById(id: string): Promise<PpaDetailDto> {
  const response = await apiClient.get<any>(`/api/Ppa/${id}`);

  // Convertir status de number a string
  return {
    ...response,
    status: NumberToPpaStatus[response.status] || 'Proposal',
  };
}

/**
 * Obtiene los PPAs de un período académico específico
 * GET /api/Ppa/by-period?academicPeriodId={academicPeriodId}
 */
export async function getPpasByPeriod(
  academicPeriodId: string
): Promise<PpaDto[]> {
  const response = await apiClient.get<any[]>('/api/Ppa/by-period', {
    params: { academicPeriodId },
  });

  // Convertir status de number a string
  return response.map((ppa) => ({
    ...ppa,
    status: NumberToPpaStatus[ppa.status] || 'Proposal',
  }));
}

/**
 * Crea un nuevo PPA
 * POST /api/Ppa
 */
export async function createPpa(command: CreatePpaCommand): Promise<void> {
  return apiClient.post<void>('/api/Ppa', command);
}

/**
 * Crea un nuevo PPA como ADMIN
 * POST /api/Ppa/admin
 * Permite especificar el docente responsable directamente
 */
export async function createPpaAsAdmin(command: CreatePpaAdminCommand): Promise<void> {
  return apiClient.post<void>('/api/Ppa/admin', command);
}

/**
 * Actualiza un PPA existente
 * PUT /api/Ppa/{id}
 */
export async function updatePpa(command: UpdatePpaCommand): Promise<void> {
  return apiClient.put<void>(`/api/Ppa/${command.id}`, command);
}

/**
 * Actualiza un PPA existente como ADMIN
 * PUT /api/Ppa/admin/{id}
 * Permite control completo sobre el PPA
 */
export async function updatePpaAsAdmin(command: UpdatePpaAdminCommand): Promise<void> {
  return apiClient.put<void>(`/api/Ppa/admin/${command.id}`, command);
}

/**
 * Cambia el estado de un PPA
 * POST /api/Ppa/{id}/status
 */
export async function changePpaStatus(
  command: ChangePpaStatusCommand
): Promise<void> {
  // Convertir status de string a number antes de enviar
  const payload = {
    id: command.id,
    newStatus: PpaStatusToNumber[command.newStatus],
  };

  return apiClient.post<void>(`/api/Ppa/${command.id}/status`, payload);
}

/**
 * Obtiene los PPAs del usuario autenticado
 * GET /api/Ppa/my?academicPeriodId={academicPeriodId}
 *
 * @param academicPeriodId - Opcional. Si se omite, retorna PPAs de todos los períodos
 */
export async function getMyPpas(
  academicPeriodId?: string
): Promise<PpaSummaryDto[]> {
  const url = academicPeriodId
    ? `/api/Ppa/my?academicPeriodId=${academicPeriodId}`
    : '/api/Ppa/my';

  const response = await apiClient.get<any[]>(url);

  // Convertir status de number a string
  return response.map((ppa) => ({
    ...ppa,
    status: NumberToPpaStatus[ppa.status] || 'Proposal',
  }));
}

/**
 * Obtiene el historial de cambios de un PPA
 * GET /api/Ppa/{id}/history
 */
export async function getPpaHistory(id: string): Promise<PpaHistoryDto[]> {
  // El historial no necesita conversión de status
  return apiClient.get<PpaHistoryDto[]>(`/api/Ppa/${id}/history`);
}

/**
 * Continúa un PPA en un nuevo período académico
 * POST /api/Ppa/{id}/continue
 *
 * @returns Respuesta con ID del nuevo PPA creado
 */
export async function continuePpa(
  command: ContinuePpaCommand
): Promise<{ id: string; message: string }> {
  return apiClient.post<{ id: string; message: string }>(
    `/api/Ppa/${command.sourcePpaId}/continue`,
    command
  );
}

// ============================================================================
// PPA ATTACHMENTS ENDPOINTS
// ============================================================================

/**
 * Obtiene todos los anexos de un PPA
 * GET /api/PpaAttachments/by-ppa/{ppaId}
 */
export async function getPpaAttachments(
  ppaId: string
): Promise<PpaAttachmentDto[]> {
  const response = await apiClient.get<any[]>(
    `/api/PpaAttachments/by-ppa/${ppaId}`
  );

  // Convertir type de number a string
  return response.map((attachment) => ({
    ...attachment,
    type: NumberToPpaAttachmentType[attachment.type] || 'Other',
  }));
}

/**
 * Obtiene anexos de un PPA filtrados por tipo
 * GET /api/PpaAttachments/by-ppa-and-type?ppaId={ppaId}&type={type}
 */
export async function getPpaAttachmentsByType(
  ppaId: string,
  type: PpaAttachmentType
): Promise<PpaAttachmentDto[]> {
  // Convertir type de string a number antes de enviar
  const typeNumber = PpaAttachmentTypeToNumber[type];

  const response = await apiClient.get<any[]>(
    '/api/PpaAttachments/by-ppa-and-type',
    {
      params: { ppaId, type: typeNumber },
    }
  );

  // Convertir type de number a string
  return response.map((attachment) => ({
    ...attachment,
    type: NumberToPpaAttachmentType[attachment.type] || 'Other',
  }));
}

/**
 * Agrega un nuevo anexo a un PPA
 * POST /api/PpaAttachments/{ppaId}
 *
 * IMPORTANTE: Primero se debe subir el archivo usando uploadFile(),
 * y luego usar el fileKey retornado para crear el anexo
 */
export async function addPpaAttachment(
  ppaId: string,
  request: AddPpaAttachmentRequest
): Promise<void> {
  // Convertir type de string a number antes de enviar
  const payload = {
    ...request,
    type: PpaAttachmentTypeToNumber[request.type],
  };

  return apiClient.post<void>(`/api/PpaAttachments/${ppaId}`, payload);
}

/**
 * Elimina un anexo de un PPA
 * DELETE /api/PpaAttachments/{id}
 *
 * Nota: Por ahora no se usa en el MVP pero se deja preparado
 */
export async function deletePpaAttachment(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/PpaAttachments/${id}`);
}

/**
 * Descarga un anexo de PPA directamente
 * GET /api/PpaAttachments/download/{attachmentId}
 *
 * Este endpoint retorna el archivo directamente con los headers correctos.
 * El navegador maneja la descarga automáticamente.
 *
 * @param attachmentId - ID del anexo a descargar
 * @returns void - Inicia la descarga del archivo en el navegador
 */
export async function downloadPpaAttachment(attachmentId: string): Promise<void> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('auth_token') || ''
    : '';

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5129'}/api/PpaAttachments/download/${attachmentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al descargar anexo: ${errorText}`);
  }

  // Obtener el nombre del archivo del header Content-Disposition
  const contentDisposition = response.headers.get('Content-Disposition');
  let fileName = 'archivo'; // Nombre por defecto

  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = fileNameMatch[1].replace(/['"]/g, '');
    }
  }

  // Crear blob y descargar
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  // Limpiar
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ============================================================================
// FILE STORAGE ENDPOINTS (MinIO)
// ============================================================================

/**
 * Sube un archivo a MinIO a través del backend
 * POST /api/FileStorage/upload
 *
 * FLUJO:
 * 1. El usuario selecciona un archivo
 * 2. Se llama a uploadFile() con FormData
 * 3. El backend sube a MinIO y retorna el fileKey
 * 4. Se usa ese fileKey para crear el PpaAttachment
 *
 * @param file - El archivo a subir
 * @param folder - Carpeta en MinIO (ej: "ppa/{ppaId}")
 * @returns Información del archivo subido incluyendo fileKey
 */
export async function uploadFile(
  file: File,
  folder?: string
): Promise<FileUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  // Para FormData, no queremos el Content-Type: application/json
  // El navegador lo establecerá automáticamente con el boundary correcto
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5129'}/api/FileStorage/upload`,
    {
      method: 'POST',
      headers: {
        // No incluir Content-Type aquí, el navegador lo hace automáticamente
        Authorization: `Bearer ${
          typeof window !== 'undefined'
            ? localStorage.getItem('auth_token') || ''
            : ''
        }`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al subir archivo: ${errorText}`);
  }

  return response.json();
}

/**
 * Obtiene una URL firmada temporal para descargar un archivo de MinIO
 * GET /api/FileStorage/download/{fileKey}
 *
 * @param fileKey - La clave del archivo en MinIO
 * @returns URL firmada temporal (válida por tiempo limitado)
 */
export async function getFileDownloadUrl(fileKey: string): Promise<string> {
  const response = await apiClient.get<{ url: string }>(
    `/api/FileStorage/download/${encodeURIComponent(fileKey)}`
  );
  return response.url;
}

/**
 * Elimina un archivo de MinIO
 * DELETE /api/FileStorage/{fileKey}
 *
 * Nota: Usar con cuidado, normalmente se elimina el attachment primero
 */
export async function deleteFile(fileKey: string): Promise<void> {
  return apiClient.delete<void>(
    `/api/FileStorage/${encodeURIComponent(fileKey)}`
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper para el flujo completo de subir archivo y crear anexo
 *
 * @param ppaId - ID del PPA
 * @param file - Archivo a subir
 * @param attachmentType - Tipo de anexo
 * @param attachmentName - Nombre descriptivo del anexo
 * @returns El attachment creado (void por ahora, el backend no retorna el objeto)
 */
export async function uploadPpaAttachment(
  ppaId: string,
  file: File,
  attachmentType: PpaAttachmentType,
  attachmentName: string
): Promise<void> {
  // 1. Subir archivo a MinIO
  const uploadResult = await uploadFile(file, `ppa/${ppaId}`);

  // 2. Crear el registro de anexo en la BD
  await addPpaAttachment(ppaId, {
    type: attachmentType,
    name: attachmentName,
    fileKey: uploadResult.fileKey,
    contentType: uploadResult.contentType,
  });
}
