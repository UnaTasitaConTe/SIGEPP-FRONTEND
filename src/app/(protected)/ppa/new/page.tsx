/**
 * Página de creación de PPA
 * Ruta: /ppa/new
 *
 * Permite crear un nuevo PPA (solo ADMIN o DOCENTE)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAcademicPeriods, useActivePeriod } from '@/modules/academic';
import { useCreatePpa, CreatePpaForm, type CreatePpaFormData } from '@/modules/ppa';
import { useQuery } from '@tanstack/react-query';
import { getAssignmentsByPeriod } from '@/modules/teacherAssignments';
import { Button } from '@/components/ui/button';

export default function NewPpaPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  // Hooks de React Query
  const { data: periods = [] } = useAcademicPeriods();
  const { data: activePeriod } = useActivePeriod();

  const createMutation = useCreatePpa();

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

  // Handler para enviar el formulario
  const handleSubmit = async (data: CreatePpaFormData) => {
    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description || null,
        generalObjective: data.generalObjective || null,
        specificObjectives: data.specificObjectives || null,
        academicPeriodId: data.academicPeriodId,
        teacherAssignmentIds: data.teacherAssignmentIds,
        studentNames: data.studentNames || [],
      });

      alert('PPA creado exitosamente');
      router.push('/ppa/my');
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
  const canCreate =
    user?.roles?.includes('ADMIN') || user?.roles?.includes('DOCENTE');

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
  if (!canCreate) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Acceso no autorizado</h3>
              <p className="text-sm text-[#3c3c3b]/70 mb-4">
                Solo los administradores y docentes pueden crear PPAs.
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
        {/* Header con navegación */}
        <div className="mb-6">
          <Link href="/ppa">
            <Button
              variant="ghost"
              className="text-[#3c3c3b] hover:text-[#e30513] hover:bg-[#e30513]/5 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Mis PPAs
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#630b00]">Crear Nuevo PPA</h1>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <CreatePpaForm
          periods={periods}
          assignments={assignments}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/ppa')}
          onPeriodChange={setSelectedPeriodId}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  );
}
