/**
 * Badge para mostrar el estado de un PPA
 * Usa colores corporativos de SIGEPP
 */

import type { PpaStatus } from '../types';
import { PpaStatusLabels } from '../types';
import { PpaStatusColors } from '../types/ppa.enums';

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
};

export function PpaStatusBadge({ status, className = '' }: PpaStatusBadgeProps) {
  const label = PpaStatusLabels[status];
  const colorClass = PpaStatusColors[statusToNumber[status]];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
