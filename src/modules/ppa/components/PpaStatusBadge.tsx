/**
 * Badge para mostrar el estado de un PPA
 * Usa colores corporativos de SIGEPP
 */

import { PpaStatus, PpaStatusLabels } from '../types';
import { PpaStatus as ppaStatusEnum, PpaStatusColors } from '../types/ppa.enums';

interface PpaStatusBadgeProps {
  status: PpaStatus;
  className?: string;
}

// Convertir PpaStatus string a number para acceder al enum correcto
const statusToNumber: Record<PpaStatus, number> = {
  Proposal: 0,
  InProgress: 1,
  Completed: 2,
  Archived: 3,
  InContinuing: 4
} as const satisfies Record<string, number>;

export function PpaStatusBadge({ status, className = '' }: PpaStatusBadgeProps) {
  const label = PpaStatusLabels[status];
  const statusEnum = statusToNumber[status] as ppaStatusEnum; // <- PpaStatus
  const colorClass = PpaStatusColors[statusEnum];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
