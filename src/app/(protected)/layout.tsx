"use client";

/**
 * Protected Layout - Layout para rutas protegidas
 * Verifica autenticación y muestra UI base (topbar + contenido)
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Loader2, LayoutDashboard, Users, BookOpen, Calendar, UserCog, FileText, FolderOpen, ChevronLeft, ChevronRight, FilePlus } from 'lucide-react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Si no está autenticado, redirigir a login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Mientras carga, mostrar loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e30513] mx-auto" />
          <p className="mt-4 text-[#3c3c3b] font-medium">
            Validando sesión...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (se está redirigiendo)
  if (!user) {
    return null;
  }

  // Datos seguros con null checks
  const userName = user?.name ?? 'Usuario';
  const userRoles = user?.roles ?? [];
  const rolesText = userRoles.length > 0 ? userRoles.join(', ') : '';
  const isAdmin = userRoles.includes('ADMIN');
  const isConsultor = userRoles.includes('CONSULTA_INTERNA');
  // Navigation items
  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/ppa/my',
      label: 'Mis PPAs',
      icon: FileText,
      show: !isConsultor,
    },
    {
      href: '/admin/ppas',
      label: 'Todos los PPAs',
      icon: FolderOpen,
      show: isAdmin || isConsultor,
    },
    {
      href: '/admin/ppa/new',
      label: 'Crear PPA',
      icon: FilePlus,
      show: isAdmin,
    },
    {
      href: '/users',
      label: 'Usuarios',
      icon: Users,
      show: isAdmin,
    },
    {
      href: '/academic/periods',
      label: 'Períodos',
      icon: Calendar,
      show: isAdmin,
    },
    {
      href: '/academic/subjects',
      label: 'Asignaturas',
      icon: BookOpen,
      show: isAdmin,
    },
    {
      href: '/academic/teacher-assignments',
      label: 'Asignaciones',
      icon: UserCog,
      show: isAdmin,
    },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#630b00] text-white flex flex-col transition-all duration-300 z-50 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo y Toggle Button */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-[#e30513]" />
              <div>
                <h1 className="text-xl font-bold">SIGEPP</h1>
                <p className="text-xs text-white/70">Sistema de Gestión</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-[#9c0f06] transition-colors ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#e30513] text-white font-medium'
                    : 'text-white/80 hover:bg-[#9c0f06] hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#e30513]/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#e30513]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{userName}</p>
                  {rolesText && (
                    <p className="text-xs text-white/60 truncate">{rolesText}</p>
                  )}
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 bg-[#e30513] hover:bg-[#9c0f06] text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </>
          ) : (
            <button
              onClick={logout}
              className="w-full p-3 rounded-lg hover:bg-[#9c0f06] transition-colors flex items-center justify-center"
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Topbar */}
        <header className="bg-white border-b border-[#e30513]/20 shadow-sm sticky top-0 z-40">
          <div className="px-8 h-16 flex items-center">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#630b00]">
                {navItems.find((item) => item.href === pathname)?.label || 'SIGEPP'}
              </h2>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto mx-5 mt-5">{children}</main>
      </div>
    </div>
  );
}
