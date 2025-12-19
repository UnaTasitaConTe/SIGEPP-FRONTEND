"use client";

/**
 * Dashboard Page - Página principal del sistema
 */

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Shield, CheckCircle, FileText, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  // Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e30513] mx-auto" />
          <p className="mt-4 text-[#3c3c3b] font-medium">
            Cargando tu información...
          </p>
        </div>
      </div>
    );
  }

  // Usuario no disponible (fallback seguro)
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#3c3c3b] font-medium">No hay sesión activa</p>
        </div>
      </div>
    );
  }

  // Datos seguros con null checks
  const permissionsCount = user?.permissions?.length ?? 0;
  const rolesCount = user?.roles?.length ?? 0;
  const rolesText = user?.roles?.join(', ') ?? 'Sin roles asignados';

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="border-l-4 border-[#e30513] pl-4">
        <h1 className="text-3xl font-bold text-[#630b00]">
          Bienvenido a SIGEPP
        </h1>
        <p className="text-[#3c3c3b] mt-1 text-lg">
          {user.name}
        </p>
        <p className="text-gray-600 text-sm mt-0.5">
          Sistema de Gestión de Programas de Pago
        </p>
      </div>

      {/* Cards de información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usuario */}
        <Card className="border-[#e30513]/20 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3c3c3b]">
              Usuario
            </CardTitle>
            <User className="h-5 w-5 text-[#e30513]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#630b00]">
              {user.name}
            </div>
            <p className="text-xs text-gray-600 mt-1">{user.email}</p>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card className="border-[#9c0f06]/20 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3c3c3b]">
              Roles
            </CardTitle>
            <Shield className="h-5 w-5 text-[#9c0f06]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#630b00]">
              {rolesCount}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {rolesText}
            </p>
          </CardContent>
        </Card>

        {/* Permisos */}
        <Card className="border-[#630b00]/20 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3c3c3b]">
              Permisos
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-[#630b00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#630b00]">
              {permissionsCount}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              permisos activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado del sistema */}
      <Card className="border-[#e30513]/10 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-[#630b00]">Estado del sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <p className="text-sm text-[#3c3c3b]">
                Autenticación: <span className="font-semibold">Activa</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <p className="text-sm text-[#3c3c3b]">
                Conexión API: <span className="font-semibold">Establecida</span>
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ID de Usuario: <span className="font-mono">{user.userId}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Próximos pasos */}
      <Card className="border-dashed border-[#e30513]/30 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-[#630b00] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#e30513]" />
            Próximos pasos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            En las próximas iteraciones se agregarán módulos de:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[#3c3c3b] list-disc list-inside">
            <li>Gestión de PPAs (Programas de Pago)</li>
            <li>Periodos Académicos</li>
            <li>Materias y asignaciones</li>
            <li>Reportes y estadísticas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
