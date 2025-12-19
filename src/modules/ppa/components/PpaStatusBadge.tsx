/**
 * Badge para mostrar el estado de un PPA
 * Usa colores corporativos de SIGEPP
 */

import type { PpaStatus } from '../types';
import { PpaStatusLabels, getPpaStatusColor } from '../types';

interface PpaStatusBadgeProps {
  status: PpaStatus;
  className?: string;
}

export function PpaStatusBadge({ status, className = '' }: PpaStatusBadgeProps) {
  const colors = getPpaStatusColor(status);
  const label = PpaStatusLabels[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {label}
    </span>
  );
}
