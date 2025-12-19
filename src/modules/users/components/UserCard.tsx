/**
 * UserCard - Card para mostrar información resumida de un usuario en el listado
 */

import Link from 'next/link';
import { User, Mail, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserStatusBadge } from './UserStatusBadge';
import { RoleBadge } from './RoleBadge';
import type { UserDto } from '../types';

interface UserCardProps {
  user: UserDto;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Link href={`/users/${user.id}`}>
      <Card className="border-[#e30513]/20 shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#e30513]/40 cursor-pointer rounded-xl h-full">
        <CardContent className="p-5">
          {/* Header con nombre y estado */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#e30513] to-[#630b00] flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#630b00] truncate">
                  {user.name}
                </h3>
              </div>
            </div>
            <UserStatusBadge isActive={user.isActive} />
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 text-sm text-[#3c3c3b]/70 mb-3">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>

          {/* Roles */}
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-[#e30513] flex-shrink-0 mt-1" />
            <div className="flex flex-wrap gap-1.5 flex-1">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((roleCode) => (
                  <RoleBadge key={roleCode} roleCode={roleCode} />
                ))
              ) : (
                <span className="text-xs text-[#3c3c3b]/60 italic">
                  Sin roles asignados
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
