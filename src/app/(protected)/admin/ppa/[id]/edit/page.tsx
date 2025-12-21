/**
 * Página de edición de PPA para ADMINISTRADORES
 * Ruta: /admin/ppa/[id]/edit
 *
 * Permite al admin editar completamente un PPA:
 * - Información básica (título, descripción, objetivos)
 * - Cambiar docente responsable
 * - Modificar asignaciones docentes
 * - Agregar nuevos estudiantes
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { usePpaDetail, useUpdatePpa, AdminEditPpaForm } from '@/modules/ppa';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/modules/users';
import { getAssignmentsByPeriod } from '@/modules/teacherAssignments';
import { Button } from '@/components/ui/button';
import type { UpdatePpaFormData } from '@/modules/ppa/schemas/ppa.schemas';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditPpaPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Obtener detalle del PPA
  const {
    data: ppa,
    isLoading: isLoadingPpa,
    error: ppaError,
  } = usePpaDetail(id);

  const updateMutation = useUpdatePpa();

  // Obtener usuarios para selector de docente
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    enabled: !!ppa, // Solo cargar si hay PPA
  });

  // Obtener asignaciones del período del PPA
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments-by-period', ppa?.academicPeriodId],
    queryFn: () =>
      ppa?.academicPeriodId
        ? getAssignmentsByPeriod({ academicPeriodId: ppa.academicPeriodId })
        : Promise.resolve([]),
    enabled: !!ppa?.academicPeriodId,
  });

  // Filtrar solo docentes
  const teachers = users.filter((u) => u.roles?.includes('DOCENTE'));

  // Handler para enviar el formulario
  const handleSubmit = async (data: UpdatePpaFormData) => {
    try {
      await updateMutation.mutateAsync(data);

      alert('PPA actualizado exitosamente');
      router.push(`/ppa/${id}`);
    } catch (error) {
      console.error('Error al actualizar PPA:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al actualizar PPA. Intenta de nuevo.'
      );
    }
  };

  // Verificar permisos
  const isAdmin = user?.roles?.includes('ADMIN');

  // Loading state
  if (isAuthLoading || isLoadingPpa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e30513] mx-auto" />
          <p className="mt-4 text-[#3c3c3b]">Cargando PPA...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (ppaError || !ppa) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Error al cargar PPA</h3>
              <p className="text-sm text-[#3c3c3b]/70 mb-4">
                No se pudo cargar la información del PPA. Verifica que el ID sea
                correcto o intenta más tarde.
              </p>
              <Link href="/admin/ppas">
                <Button className="bg-[#e30513] hover:bg-[#9c0f06] text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a PPAs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Acceso Denegado</h3>
              <p className="text-sm text-[#3c3c3b]/70 mb-4">
                Solo los administradores pueden editar completamente los PPAs.
              </p>
              <Link href={`/ppa/${id}`}>
                <Button className="bg-[#e30513] hover:bg-[#9c0f06] text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ver PPA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/ppa/${id}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-[#3c3c3b]/30 text-[#3c3c3b] hover:bg-[#3c3c3b]/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-[#e30513]">
              <BookOpen className="h-6 w-6" />
              <h1 className="text-2xl font-bold text-[#3c3c3b]">
                Editar PPA (Administrador)
              </h1>
            </div>
          </div>
          <p className="text-[#3c3c3b]/70 text-sm">
            Como administrador, puedes editar todos los aspectos del PPA incluyendo el
            docente responsable y las asignaciones.
          </p>
        </div>

        {/* Formulario */}
        <AdminEditPpaForm
          ppa={ppa}
          teachers={teachers}
          assignments={assignments}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/ppa/${id}`)}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
