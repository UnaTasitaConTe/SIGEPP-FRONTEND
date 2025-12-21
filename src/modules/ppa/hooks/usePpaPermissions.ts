import { useMemo } from 'react';
import { PpaStatus } from '../types/ppa.enums';
import type { PpaSummaryDto, PpaDetailDto } from '../types/ppa.types';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export interface PpaPermissions {
  canView: boolean;
  canEdit: boolean;
  canChangeStatus: boolean;
  canUploadAttachment: boolean;
  canDeleteAttachment: boolean;
  canContinue: boolean;
  canChangeResponsible: boolean;
  canChangeAssignments: boolean;
}

/**
 * Hook para calcular permisos de un PPA según usuario actual
 * Basado en reglas del backend (Application\Ppa\PpaAppService.cs:184-193)
 */
export function usePpaPermissions(
  ppa: PpaSummaryDto | PpaDetailDto | null
): PpaPermissions {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !ppa) {
      return {
        canView: false,
        canEdit: false,
        canChangeStatus: false,
        canUploadAttachment: false,
        canDeleteAttachment: false,
        canContinue: false,
        canChangeResponsible: false,
        canChangeAssignments: false
      };
    }

    const isAdmin = user.roles?.includes('ADMIN') ?? false;

    // PpaSummaryDto usa responsibleTeacherId, PpaDetailDto usa primaryTeacherId
    const responsibleId = 'responsibleTeacherId' in ppa
      ? ppa.responsibleTeacherId
      : ppa.primaryTeacherId;

    const isResponsible = responsibleId === user.userId;

    const isInEditableState =
      ppa.status !== PpaStatus.Completed &&
      ppa.status !== PpaStatus.Archived;

    return {
      // Ver: ADMIN ve todos, DOCENTE solo propios
      canView: isAdmin || isResponsible,

      // Editar: ADMIN siempre, DOCENTE solo en estados editables
      canEdit: isAdmin || (isResponsible && isInEditableState),

      // Cambiar estado: solo ADMIN
      canChangeStatus: isAdmin,

      // Subir anexos: ADMIN o responsable (en cualquier estado)
      canUploadAttachment: isAdmin || isResponsible,

      // Eliminar anexos: ADMIN o responsable
      canDeleteAttachment: isAdmin || isResponsible,

      // Continuar: ADMIN o responsable
      canContinue: isAdmin || isResponsible,

      // Cambiar responsable: ADMIN siempre, DOCENTE solo en estados editables
      canChangeResponsible: isAdmin || (isResponsible && isInEditableState),

      // Cambiar asignaciones: ADMIN siempre, DOCENTE solo en estados editables
      canChangeAssignments: isAdmin || (isResponsible && isInEditableState)
    };
  }, [user, ppa]);
}

/**
 * Hook simplificado para verificar si usuario puede realizar acción específica
 */
export function useCan(
  action: keyof PpaPermissions,
  ppa: PpaSummaryDto | PpaDetailDto | null
): boolean {
  const permissions = usePpaPermissions(ppa);
  return permissions[action];
}
