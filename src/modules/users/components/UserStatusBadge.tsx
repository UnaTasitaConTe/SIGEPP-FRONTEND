/**
 * UserStatusBadge - Badge para mostrar el estado de un usuario (Activo/Inactivo)
 */

import { getUserStatusColor } from '../types';

interface UserStatusBadgeProps {
  isActive: boolean;
}

export function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  const colors = getUserStatusColor(isActive);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}
