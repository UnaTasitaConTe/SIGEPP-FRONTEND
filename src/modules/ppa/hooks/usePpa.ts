/**
 * React Query hooks para el módulo PPA
 * Facilita el uso de las funciones de API con cache automático y revalidación
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PpaDto,
  PpaDetailDto,
  PpaSummaryDto,
  PpaHistoryDto,
  PpaAttachmentDto,
  CreatePpaCommand,
  UpdatePpaCommand,
  ChangePpaStatusCommand,
  ContinuePpaCommand,
  AddPpaAttachmentRequest,
  PpaAttachmentType,
} from '../types';
import {
  getPpasByTeacher,
  getPpasByPeriod,
  getPpaById,
  getMyPpas,
  getPpaHistory,
  createPpa,
  updatePpa,
  changePpaStatus,
  continuePpa,
  getPpaAttachments,
  getPpaAttachmentsByType,
  addPpaAttachment,
  deletePpaAttachment,
  uploadPpaAttachment,
} from '../api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const ppaKeys = {
  all: ['ppas'] as const,
  lists: () => [...ppaKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...ppaKeys.lists(), filters] as const,
  byTeacher: (teacherId: string, academicPeriodId: string) =>
    [...ppaKeys.lists(), { teacherId, academicPeriodId }] as const,
  byPeriod: (academicPeriodId: string) =>
    [...ppaKeys.lists(), { academicPeriodId }] as const,
  my: (academicPeriodId?: string) =>
    [...ppaKeys.lists(), 'my', academicPeriodId] as const,
  details: () => [...ppaKeys.all, 'detail'] as const,
  detail: (id: string) => [...ppaKeys.details(), id] as const,
  history: (id: string) => [...ppaKeys.all, 'history', id] as const,
  attachments: (ppaId: string) => [...ppaKeys.all, 'attachments', ppaId] as const,
  attachmentsByType: (ppaId: string, type: PpaAttachmentType) =>
    [...ppaKeys.attachments(ppaId), type] as const,
};

// ============================================================================
// QUERIES - PPA
// ============================================================================

/**
 * Hook para obtener PPAs de un docente en un período específico
 */
export function usePpasByTeacher(teacherId: string, academicPeriodId: string) {
  return useQuery({
    queryKey: ppaKeys.byTeacher(teacherId, academicPeriodId),
    queryFn: () => getPpasByTeacher(teacherId, academicPeriodId),
    enabled: !!teacherId && !!academicPeriodId,
  });
}

/**
 * Hook para obtener PPAs de un período académico
 */
export function usePpasByPeriod(academicPeriodId: string) {
  return useQuery({
    queryKey: ppaKeys.byPeriod(academicPeriodId),
    queryFn: () => getPpasByPeriod(academicPeriodId),
    enabled: !!academicPeriodId,
  });
}

/**
 * Hook para obtener el detalle de un PPA
 */
export function usePpaDetail(id: string) {
  return useQuery({
    queryKey: ppaKeys.detail(id),
    queryFn: () => getPpaById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener los PPAs del usuario autenticado
 */
export function useMyPpas(academicPeriodId?: string) {
  return useQuery({
    queryKey: ppaKeys.my(academicPeriodId),
    queryFn: () => getMyPpas(academicPeriodId),
  });
}

/**
 * Hook para obtener el historial de cambios de un PPA
 */
export function usePpaHistory(id: string) {
  return useQuery({
    queryKey: ppaKeys.history(id),
    queryFn: () => getPpaHistory(id),
    enabled: !!id,
  });
}

// ============================================================================
// QUERIES - ATTACHMENTS
// ============================================================================

/**
 * Hook para obtener todos los anexos de un PPA
 */
export function usePpaAttachments(ppaId: string) {
  return useQuery({
    queryKey: ppaKeys.attachments(ppaId),
    queryFn: () => getPpaAttachments(ppaId),
    enabled: !!ppaId,
  });
}

/**
 * Hook para obtener anexos de un PPA filtrados por tipo
 */
export function usePpaAttachmentsByType(ppaId: string, type: PpaAttachmentType) {
  return useQuery({
    queryKey: ppaKeys.attachmentsByType(ppaId, type),
    queryFn: () => getPpaAttachmentsByType(ppaId, type),
    enabled: !!ppaId && !!type,
  });
}

// ============================================================================
// MUTATIONS - PPA
// ============================================================================

/**
 * Hook para crear un nuevo PPA
 */
export function useCreatePpa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreatePpaCommand) => createPpa(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ppaKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un PPA
 */
export function useUpdatePpa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: UpdatePpaCommand) => updatePpa(command),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ppaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ppaKeys.lists() });
    },
  });
}

/**
 * Hook para cambiar el estado de un PPA
 */
export function useChangePpaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: ChangePpaStatusCommand) => changePpaStatus(command),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ppaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ppaKeys.lists() });
    },
  });
}

/**
 * Hook para continuar un PPA en un nuevo período académico
 */
export function useContinuePpa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: ContinuePpaCommand) => continuePpa(command),
    onSuccess: (_, variables) => {
      // Invalidar el detalle del PPA origen (ahora hasContinuation = true)
      queryClient.invalidateQueries({
        queryKey: ppaKeys.detail(variables.sourcePpaId),
      });
      // Invalidar todos los listados
      queryClient.invalidateQueries({ queryKey: ppaKeys.lists() });
    },
  });
}

// ============================================================================
// MUTATIONS - ATTACHMENTS
// ============================================================================

/**
 * Hook para agregar un anexo a un PPA
 */
export function useAddPpaAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ppaId,
      request,
    }: {
      ppaId: string;
      request: AddPpaAttachmentRequest;
    }) => addPpaAttachment(ppaId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ppaKeys.attachments(variables.ppaId),
      });
    },
  });
}

/**
 * Hook para eliminar un anexo
 */
export function useDeletePpaAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => deletePpaAttachment(attachmentId),
    onSuccess: () => {
      // Invalidar todas las queries de attachments
      queryClient.invalidateQueries({ queryKey: ppaKeys.all });
    },
  });
}

/**
 * Hook para subir archivo y crear anexo en un solo paso
 */
export function useUploadPpaAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ppaId,
      file,
      attachmentType,
      attachmentName,
    }: {
      ppaId: string;
      file: File;
      attachmentType: PpaAttachmentType;
      attachmentName: string;
    }) => uploadPpaAttachment(ppaId, file, attachmentType, attachmentName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ppaKeys.attachments(variables.ppaId),
      });
    },
  });
}
