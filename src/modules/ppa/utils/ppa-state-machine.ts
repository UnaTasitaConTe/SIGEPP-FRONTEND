// PPA State Machine - align with backend Domain\Ppa\Entities\Ppa.cs:210-226
import { PpaStatus } from '../types/ppa.enums';

/**
 * Valida si se puede realizar una transición de estado
 * Reglas:
 * 1. Solo ADMIN puede cambiar estados
 * 2. Archived es estado terminal (no se puede salir)
 * 3. Todas las demás transiciones están permitidas (incluyendo regresiones)
 */
export function canTransitionTo(
  currentStatus: PpaStatus,
  newStatus: PpaStatus,
  userRole: string
): boolean {
  // Solo ADMIN puede cambiar estados
  if (userRole !== 'ADMIN') {
    return false;
  }

  // No se puede salir de Archived
  if (currentStatus === PpaStatus.Archived) {
    return false;
  }

  // Mismo estado (sin cambios, pero permitido)
  if (currentStatus === newStatus) {
    return true;
  }

  // Cualquier otra transición es válida
  return true;
}

/**
 * Obtiene los estados disponibles para transición desde el estado actual
 */
export function getAvailableTransitions(
  currentStatus: PpaStatus,
  userRole: string
): PpaStatus[] {
  if (userRole !== 'ADMIN') {
    return [];
  }

  if (currentStatus === PpaStatus.Archived) {
    return [];
  }

  // Retorna todos los estados excepto el actual
  return [
    PpaStatus.Proposal,
    PpaStatus.InProgress,
    PpaStatus.Completed,
    PpaStatus.Archived
  ].filter(s => s !== currentStatus);
}

/**
 * Verifica si un estado es terminal (no permite transiciones de salida)
 */
export function isTerminalState(status: PpaStatus): boolean {
  return status === PpaStatus.Archived;
}

/**
 * Verifica si un estado permite edición completa
 * Estados editables: Proposal, InProgress
 * Estados restringidos: Completed, Archived (DOCENTE no puede cambiar responsable/asignaciones)
 */
export function isEditableState(status: PpaStatus): boolean {
  return status === PpaStatus.Proposal || status === PpaStatus.InProgress;
}

/**
 * Verifica si se permite cambiar responsable/asignaciones según estado y rol
 */
export function canChangeStructure(
  status: PpaStatus,
  userRole: string
): boolean {
  // ADMIN siempre puede
  if (userRole === 'ADMIN') {
    return true;
  }

  // DOCENTE solo en estados editables
  return isEditableState(status);
}

/**
 * Obtiene el siguiente estado sugerido según flujo normal
 * (no obligatorio, solo recomendación UI)
 */
export function getNextSuggestedStatus(currentStatus: PpaStatus): PpaStatus | null {
  switch (currentStatus) {
    case PpaStatus.Proposal:
      return PpaStatus.InProgress;
    case PpaStatus.InProgress:
      return PpaStatus.Completed;
    case PpaStatus.Completed:
      return PpaStatus.Archived;
    case PpaStatus.Archived:
      return null; // Estado terminal
    default:
      return null;
  }
}
