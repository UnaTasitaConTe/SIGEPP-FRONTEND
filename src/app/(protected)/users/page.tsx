/**
 * Página de gestión de usuarios
 * Ruta: /users
 *
 * Permite a los administradores ver, buscar y gestionar usuarios del sistema
 */

'use client';

import { useState } from 'react';
import { Users as UsersIcon, Search, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useUsers } from '@/modules/users/hooks/useUsers';
import { UserCard } from '@/modules/users/components/UserCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UsersPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Obtener usuarios
  const { data: users = [], isLoading, error } = useUsers();

  // Verificar que el usuario sea ADMIN
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  // Mientras carga autenticación
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e30513] mx-auto" />
          <p className="mt-4 text-[#3c3c3b]">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no es admin, mostrar mensaje de no autorizado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Acceso no autorizado</h3>
              <p className="text-sm text-[#3c3c3b]/70">
                Solo los administradores pueden acceder a la gestión de usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar usuarios según búsqueda y estado
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#630b00]">
                  Gestión de Usuarios
                </h1>
                <p className="text-[#3c3c3b]/60">
                  Administración de usuarios del sistema
                </p>
              </div>
            </div>

            {/* Botón crear nuevo usuario */}
            <Link href="/users/new">
              <Button className="bg-[#e30513] hover:bg-[#9c0f06] text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e30513]/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <Label htmlFor="search" className="text-[#3c3c3b] font-medium mb-2">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3c3c3b]/40" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#3c3c3b]/20 focus:border-[#e30513]"
                />
              </div>
            </div>

            {/* Filtro de estado */}
            <div>
              <Label htmlFor="status" className="text-[#3c3c3b] font-medium mb-2">
                Estado
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as 'all' | 'active' | 'inactive')
                }
              >
                <SelectTrigger
                  id="status"
                  className="border-[#3c3c3b]/20 focus:border-[#e30513]"
                >
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  <SelectItem value="active">Solo activos</SelectItem>
                  <SelectItem value="inactive">Solo inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-[#3c3c3b]/10">
            <p className="text-sm text-[#3c3c3b]/70">
              Mostrando{' '}
              <span className="font-semibold text-[#630b00]">
                {filteredUsers.length}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-[#630b00]">{users.length}</span>{' '}
              {users.length === 1 ? 'usuario' : 'usuarios'}
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#e30513]" />
            <div>
              <p className="font-medium mb-1">Error al cargar usuarios</p>
              <p className="text-sm text-[#3c3c3b]/70">
                No se pudieron cargar los usuarios. Intenta recargar la página.
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#e30513] mx-auto" />
              <p className="mt-3 text-sm text-[#3c3c3b]/60">Cargando usuarios...</p>
            </div>
          </div>
        )}

        {/* Lista de usuarios */}
        {!isLoading && !error && (
          <>
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20 py-12">
                <div className="text-center">
                  <UsersIcon className="h-16 w-16 mx-auto mb-4 text-[#3c3c3b]/30" />
                  <h3 className="text-lg font-medium text-[#630b00] mb-2">
                    No se encontraron usuarios
                  </h3>
                  <p className="text-sm text-[#3c3c3b]/60">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Aún no hay usuarios en el sistema'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
