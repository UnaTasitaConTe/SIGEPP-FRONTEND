/**
 * Página de detalle de PPA
 * Ruta: /ppa/[id]
 *
 * Muestra información completa del PPA y permite gestionar anexos
 */

'use client';

import { use, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  FileText,
  Target,
  Loader2,
  AlertCircle,
  GraduationCap,
  Edit,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import {
  getFileDownloadUrl,
  usePpaDetail,
  usePpaAttachments,
  useChangePpaStatus,
  PpaStatusLabels,
  type PpaStatus,
} from '@/modules/ppa';
import { PpaStatusBadge } from '@/modules/ppa/components/PpaStatusBadge';
import { PpaAttachmentsSection } from '@/modules/ppa/components/PpaAttachmentsSection';
import { UploadAttachmentForm } from '@/modules/ppa/components/UploadAttachmentForm';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PpaAttachmentDto } from '@/modules/ppa/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PpaDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Obtener detalle del PPA usando el hook
  const {
    data: ppa,
    isLoading: isLoadingPpa,
    error: ppaError,
  } = usePpaDetail(id);

  // Obtener anexos del PPA usando el hook
  const {
    data: attachments = [],
    isLoading: isLoadingAttachments,
    error: attachmentsError,
  } = usePpaAttachments(id);

  // Mutation para cambiar estado
  const changeStatusMutation = useChangePpaStatus();

  // Handler para refrescar anexos después de subir uno nuevo
  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ppas', 'attachments', id] });
  };

  // Handler para descargar un anexo
  const handleDownloadAttachment = async (attachment: PpaAttachmentDto) => {
    try {
      const url = await getFileDownloadUrl(attachment.fileKey);
      // Abrir en nueva pestaña para descargar
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      alert('Error al descargar el archivo. Intenta de nuevo.');
    }
  };

  // Verificar permisos
  const isAdmin = user?.roles?.includes('ADMIN');
  const isPrimaryTeacher = ppa && user?.userId === ppa.primaryTeacherId;
  const canEdit = isAdmin || isPrimaryTeacher;
  const canUploadAttachments = isAdmin || user?.roles?.includes('DOCENTE');
  const canChangeStatus = canEdit;

  // Handler para cambiar estado
  const handleChangeStatus = async (newStatus: PpaStatus) => {
    if (!ppa) return;

    const confirmation = confirm(
      `¿Cambiar el estado del PPA a "${PpaStatusLabels[newStatus]}"?`
    );

    if (!confirmation) return;

    try {
      await changeStatusMutation.mutateAsync({
        id: ppa.id,
        newStatus,
      });
      alert('Estado actualizado correctamente');
      setIsChangingStatus(false);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al cambiar estado. Intenta de nuevo.'
      );
    }
  };

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
  if (ppaError) {
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
                  Volver a Mis PPA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ppa || !user) {
    return null;
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
              Volver a Mis PPA
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#630b00] mb-1">
                  {ppa.title}
                </h1>
                <p className="text-sm text-[#3c3c3b]/60">
                  Detalle del Programa de Posgrado Académico
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PpaStatusBadge status={ppa.status} />

              {canEdit && (
                <Link href={`/ppa/${id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Cambio de estado */}
        {canChangeStatus && (
          <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#630b00] flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-[#e30513]" />
                Cambiar Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isChangingStatus ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#3c3c3b]/70">
                    Selecciona el nuevo estado:
                  </p>
                  <Select
                    value={ppa.status}
                    onValueChange={(value) => handleChangeStatus(value as PpaStatus)}
                    disabled={changeStatusMutation.isPending}
                  >
                    <SelectTrigger className="max-w-xs border-[#3c3c3b]/20 focus:border-[#e30513]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proposal">
                        {PpaStatusLabels.Proposal}
                      </SelectItem>
                      <SelectItem value="InProgress">
                        {PpaStatusLabels.InProgress}
                      </SelectItem>
                      <SelectItem value="Completed">
                        {PpaStatusLabels.Completed}
                      </SelectItem>
                      <SelectItem value="Archived">
                        {PpaStatusLabels.Archived}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingStatus(false)}
                    disabled={changeStatusMutation.isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsChangingStatus(true)}
                  variant="outline"
                  size="sm"
                  className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Cambiar Estado del PPA
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Información general del PPA */}
        <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#630b00]">
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Período académico */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#e30513] flex-shrink-0" />
              <div>
                <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase">
                  Período Académico
                </p>
                <p className="text-sm text-[#3c3c3b] font-medium">
                  {ppa.academicPeriodCode || 'N/A'}
                </p>
              </div>
            </div>

            {/* Docente */}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#e30513] flex-shrink-0" />
              <div>
                <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase">
                  Docente Responsable
                </p>
                <p className="text-sm text-[#3c3c3b] font-medium">
                  {ppa.primaryTeacherName || 'Sin asignar'}
                </p>
              </div>
            </div>

            {/* Descripción */}
            {ppa.description && (
              <div className="pt-2 border-t border-[#3c3c3b]/10">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[#e30513] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase mb-1">
                      Descripción
                    </p>
                    <p className="text-sm text-[#3c3c3b] leading-relaxed">
                      {ppa.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Objetivo general */}
            {ppa.generalObjective && (
              <div className="pt-2 border-t border-[#3c3c3b]/10">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-[#e30513] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase mb-1">
                      Objetivo General
                    </p>
                    <p className="text-sm text-[#3c3c3b] leading-relaxed">
                      {ppa.generalObjective}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Objetivos específicos */}
            {ppa.specificObjectives && (
              <div className="pt-2 border-t border-[#3c3c3b]/10">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-[#e30513] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase mb-1">
                      Objetivos Específicos
                    </p>
                    <p className="text-sm text-[#3c3c3b] leading-relaxed whitespace-pre-line">
                      {ppa.specificObjectives}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asignaciones de docente */}
        {ppa.teacherAssignmentIds && ppa.teacherAssignmentIds.length > 0 && (
          <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#630b00] flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#e30513]" />
                Asignaciones Docentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#3c3c3b]/70">
                Este PPA incluye{' '}
                <span className="font-semibold text-[#630b00]">
                  {ppa.teacherAssignmentIds.length}
                </span>{' '}
                {ppa.teacherAssignmentIds.length === 1
                  ? 'asignación docente'
                  : 'asignaciones docentes'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Formulario de subida de anexos (solo para DOCENTE y ADMIN) */}
        {canUploadAttachments && (
          <div className="mb-6">
            <UploadAttachmentForm
              ppaId={id}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        )}

        {/* Sección de anexos */}
        <div>
          <h2 className="text-xl font-bold text-[#630b00] mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#e30513]" />
            Anexos del PPA
          </h2>

          {isLoadingAttachments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#e30513]" />
            </div>
          ) : attachmentsError ? (
            <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-4 py-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#e30513]" />
              <p className="text-sm">Error al cargar anexos</p>
            </div>
          ) : (
            <PpaAttachmentsSection
              attachments={attachments}
              onDownload={handleDownloadAttachment}
            />
          )}
        </div>

        {/* Información de auditoría */}
        <div className="mt-8 pt-6 border-t border-[#3c3c3b]/10">
          <div className="flex flex-wrap gap-6 text-xs text-[#3c3c3b]/60">
            <div>
              <span className="font-medium">Creado:</span>{' '}
              {new Date(ppa.createdAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            {ppa.updatedAt && (
              <div>
                <span className="font-medium">Última actualización:</span>{' '}
                {new Date(ppa.updatedAt).toLocaleString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
