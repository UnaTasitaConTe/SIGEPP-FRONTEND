/**
 * Página de creación de PPA para ADMINISTRADORES
 * Ruta: /admin/ppa/new
 *
 * Permite al admin crear un PPA seleccionando:
 * - Docente responsable
 * - Período académico
 * - Asignaciones docentes
 * - Estudiantes
 *
 * NOTA: Debido a limitación del backend (CreatePpaCommand no tiene primaryTeacherId),
 * se implementa un workaround: crear + editar inmediatamente para asignar responsable.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAcademicPeriods, useActivePeriod } from '@/modules/academic';
import { useCreatePpa, useUpdatePpa, AdminCreatePpaForm } from '@/modules/ppa';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/modules/users';
import { getAssignmentsByPeriod } from '@/modules/teacherAssignments';
import { Button } from '@/components/ui/button';
import type { CreatePpaFormData } from '@/modules/ppa/schemas/ppa.schemas';

// Tipo extendido que incluye responsibleTeacherId
interface AdminCreatePpaFormData extends CreatePpaFormData {
  responsibleTeacherId?: string;
}

export default function AdminNewPpaPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  // Hooks de React Query
  const { data: periods = [] } = useAcademicPeriods();
  const { data: activePeriod } = useActivePeriod();
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  const createMutation = useCreatePpa();
  const updateMutation = useUpdatePpa();

  // Obtener asignaciones del período seleccionado
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments-by-period', selectedPeriodId],
    queryFn: () =>
      selectedPeriodId
        ? getAssignmentsByPeriod({ academicPeriodId: selectedPeriodId })
        : Promise.resolve([]),
    enabled: !!selectedPeriodId,
  });

  // Establecer período activo por defecto
  useEffect(() => {
    if (activePeriod && !selectedPeriodId) {
      setSelectedPeriodId(activePeriod.id);
    } else if (!activePeriod && periods.length > 0 && !selectedPeriodId) {
      setSelectedPeriodId(periods[0].id);
    }
  }, [activePeriod, periods, selectedPeriodId]);

  // Filtrar solo docentes
  const teachers = users.filter((u) => u.roles?.includes('DOCENTE'));

  // Handler para enviar el formulario
  const handleSubmit = async (data: AdminCreatePpaFormData) => {
    try {
      // Paso 1: Crear el PPA (el backend asigna al usuario actual como responsable)
      const createResult = await createMutation.mutateAsync({
        title: data.title,
        description: data.description || null,
        generalObjective: data.generalObjective || null,
        specificObjectives: data.specificObjectives || null,
        academicPeriodId: data.academicPeriodId,
        teacherAssignmentIds: data.teacherAssignmentIds,
        studentNames: data.studentNames || [],
      });

      // Paso 2: Si se seleccionó un docente responsable diferente, actualizar
      if (data.responsibleTeacherId && createResult?.id) {
        await updateMutation.mutateAsync({
          id: createResult.id,
          title: data.title,
          description: data.description || null,
          generalObjective: data.generalObjective || null,
          specificObjectives: data.specificObjectives || null,
          newResponsibleTeacherId: data.responsibleTeacherId,
          newTeacherAssignmentIds: null,
          newStudentNames: null,
        });
      }

      alert('PPA creado exitosamente');
      router.push('/admin/ppas');
    } catch (error) {
      console.error('Error al crear PPA:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al crear PPA. Intenta de nuevo.'
      );
    }
  };

  // Verificar permisos
  const isAdmin = user?.roles?.includes('ADMIN');

  // Loading state
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
                Solo los administradores pueden crear PPAs para otros docentes.
              </p>
              <Link href="/ppa">
                <Button className="bg-[#e30513] hover:bg-[#9c0f06] text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Mis PPAs
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
            <Link href="/admin/ppas">
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
                Crear PPA (Administrador)
              </h1>
            </div>
          </div>
          <p className="text-[#3c3c3b]/70 text-sm">
            Como administrador, puedes crear un PPA y asignar el docente responsable.
          </p>
        </div>

        {/* Formulario */}
        <AdminCreatePpaForm
          periods={periods}
          teachers={teachers}
          assignments={assignments}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/ppas')}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}
