/**
 * RoleBadge - Badge para mostrar un rol de usuario
 */

import { getRoleBadgeColor, UserRoleLabels, UserRole } from '../types';

interface RoleBadgeProps {
  roleCode: string;
}

export function RoleBadge({ roleCode }: RoleBadgeProps) {
  const colors = getRoleBadgeColor(roleCode);
  const label = UserRoleLabels[roleCode as UserRole] || roleCode;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {label}
    </span>
  );
}
