/**
 * Página de edición de PPA
 * Ruta: /ppa/[id]/edit
 *
 * Permite editar un PPA existente
 * NOTA: Solo se pueden editar título, descripción y objetivos.
 * El período, docente y asignaciones NO se pueden modificar.
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { usePpaDetail, useUpdatePpa } from '@/modules/ppa';
import { PpaForm, type PpaFormData } from '@/modules/ppa/components/PpaForm';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPpaPage({ params }: PageProps) {
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

  // Handler para enviar el formulario
  const handleSubmit = async (data: PpaFormData) => {
    try {
      await updateMutation.mutateAsync({
        id,
        title: data.title,
        description: data.description || null,
        generalObjective: data.generalObjective || null,
        specificObjectives: data.specificObjectives || null,
      });

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

  // Verificar permisos (el usuario debe ser el docente responsable o ADMIN)
  const canEdit =
    user?.roles?.includes('ADMIN') ||
    (ppa && user?.userId === ppa.primaryTeacherId);

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

  // Check permissions
  if (!canEdit) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Acceso no autorizado</h3>
              <p className="text-sm text-[#3c3c3b]/70 mb-4">
                Solo el docente responsable o los administradores pueden editar
                este PPA.
              </p>
              <Link href={`/ppa/${id}`}>
                <Button className="bg-[#e30513] hover:bg-[#9c0f06] text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Detalle
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
          <Link href={`/ppa/${id}`}>
            <Button
              variant="ghost"
              className="text-[#3c3c3b] hover:text-[#e30513] hover:bg-[#e30513]/5 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Detalle
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#630b00]">Editar PPA</h1>
              <p className="text-sm text-[#3c3c3b]/60">{ppa.title}</p>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          <p className="text-sm">
            <strong>Nota:</strong> Solo puedes modificar el título, descripción y
            objetivos. El período académico, docente responsable y asignaciones no
            pueden modificarse una vez creado el PPA.
          </p>
        </div>

        {/* Formulario */}
        <PpaForm
          mode="edit"
          initialData={ppa}
          periods={[
            {
              id: ppa.academicPeriodId,
              name: ppa.academicPeriodCode || 'N/A',
              code: ppa.academicPeriodCode,
            },
          ]}
          teachers={[
            {
              id: ppa.primaryTeacherId,
              name: ppa.primaryTeacherName || 'Sin asignar',
            },
          ]}
          assignments={[]}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/ppa/${id}`)}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
