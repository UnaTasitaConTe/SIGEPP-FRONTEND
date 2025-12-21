/**
 * Página de detalle de PPA
 * Ruta: /ppa/[id]
 *
 * Muestra información completa del PPA y permite gestionar anexos
 */

'use client';

import { use, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation';
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
  GitBranch,
  History as HistoryIcon,
  Paperclip,
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
  type PpaSummaryDto,
} from '@/modules/ppa';
import { PpaStatusBadge } from '@/modules/ppa/components/PpaStatusBadge';
import { PpaAttachmentsSection } from '@/modules/ppa/components/PpaAttachmentsSection';
import { UploadAttachmentForm } from '@/modules/ppa/components/UploadAttachmentForm';
import { PpaHistory } from '@/modules/ppa/components/PpaHistory';
import { ContinuePpaDialog } from '@/modules/ppa/components/ContinuePpaDialog';
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
import { getAssignmentsByPeriod } from '@/modules/teacherAssignments';
import { getUsers } from '@/modules/users';
import { getAcademicPeriods } from '@/modules/academic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PpaDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'history'>('details');
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [selectedPeriodForContinue, setSelectedPeriodForContinue] = useState<string>('');

  // Obtener detalle del PPA usando el hook
  const {
    data: ppa,
    isLoading: isLoadingPpa,
    error: ppaError,
  } = usePpaDetail(id);

  // Obtener períodos académicos para el diálogo de continuar PPA
  const { data: periods = [] } = useQuery({
    queryKey: ['academic-periods'],
    queryFn: () => getAcademicPeriods(),
    enabled: showContinueDialog,
  });

  // Obtener asignaciones del período seleccionado para continuar
  const { data: assignmentsForContinue = [] } = useQuery({
    queryKey: ['assignments-by-period', selectedPeriodForContinue],
    queryFn: () =>
      selectedPeriodForContinue
        ? getAssignmentsByPeriod({ academicPeriodId: selectedPeriodForContinue })
        : Promise.resolve([]),
    enabled: showContinueDialog && !!selectedPeriodForContinue,
  });

  // Obtener docentes disponibles (solo para admins)
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    enabled: showContinueDialog ,
  });

  const teachers = users.filter((u) => u.roles?.includes('DOCENTE'));

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
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <PpaStatusBadge status={ppa.status} />

              {ppa.isContinuation && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <GitBranch className="h-3 w-3 mr-1" />
                  Continuación
                </span>
              )}

              {ppa.hasContinuation && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Tiene continuación
                </span>
              )}

              {canEdit && ppa.status === 'Completed' && !ppa.hasContinuation && (
                <Button
                  onClick={() => setShowContinueDialog(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Continuar PPA
                </Button>
              )}

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

        {/* Tabs de navegación */}
        <div className="mb-6 border-b border-[#3c3c3b]/10">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'details'
                  ? 'text-[#e30513]'
                  : 'text-[#3c3c3b]/60 hover:text-[#3c3c3b]'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalles
              </span>
              {activeTab === 'details' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e30513]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('attachments')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'attachments'
                  ? 'text-[#e30513]'
                  : 'text-[#3c3c3b]/60 hover:text-[#3c3c3b]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Anexos
                {attachments && attachments.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#e30513]/10 text-[#e30513] rounded-full">
                    {attachments.length}
                  </span>
                )}
              </span>
              {activeTab === 'attachments' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e30513]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'history'
                  ? 'text-[#e30513]'
                  : 'text-[#3c3c3b]/60 hover:text-[#3c3c3b]'
              }`}
            >
              <span className="flex items-center gap-2">
                <HistoryIcon className="h-4 w-4" />
                Historial
              </span>
              {activeTab === 'history' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e30513]" />
              )}
            </button>
          </div>
        </div>

        {/* Tab: Detalles */}
        {activeTab === 'details' && (
          <>
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
            {ppa.assignmentDetails && ppa.assignmentDetails.length > 0 && (
              <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#630b00] flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#e30513]" />
                    Asignaciones Docentes ({ppa.assignmentDetails.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ppa.assignmentDetails.map((assignment, index) => (
                      <div
                        key={assignment.teacherAssignmentId}
                        className="p-4 rounded-lg bg-[#f2f2f2] border border-[#3c3c3b]/10 hover:border-[#e30513]/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e30513]/10 text-[#e30513] text-xs font-bold">
                                {index + 1}
                              </span>
                              <h3 className="font-semibold text-[#630b00]">
                                {assignment.subjectCode ? `${assignment.subjectCode} - ` : ''}
                                {assignment.subjectName || 'Materia sin nombre'}
                              </h3>
                            </div>

                            {assignment.teacherName && (
                              <div className="flex items-center gap-2 ml-8 text-sm text-[#3c3c3b]/70">
                                <User className="h-3.5 w-3.5" />
                                <span>{assignment.teacherName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estudiantes */}
            {ppa.students && ppa.students.length > 0 && (
              <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#630b00] flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#e30513]" />
                    Estudiantes Participantes ({ppa.students.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ppa.students.map((student, index) => (
                      <div
                        key={student.id || `student-${index}`}
                        className="p-3 rounded-lg bg-[#f2f2f2] border border-[#3c3c3b]/10 hover:border-[#e30513]/30 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#e30513] to-[#630b00] flex items-center justify-center text-white text-sm font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3c3c3b] truncate">
                              {student.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
          </>
        )}

        {/* Tab: Anexos */}
        {activeTab === 'attachments' && (
          <>
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
                <Paperclip className="h-5 w-5 text-[#e30513]" />
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
          </>
        )}

        {/* Tab: Historial */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl font-bold text-[#630b00] mb-4 flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-[#e30513]" />
              Historial de Cambios
            </h2>
            <PpaHistory ppaId={id} />
          </div>
        )}

        {/* Dialog para continuar PPA */}
        <ContinuePpaDialog
          ppa={ppa as unknown as PpaSummaryDto}
          isOpen={showContinueDialog}
          onClose={() => {
            setShowContinueDialog(false);
            setSelectedPeriodForContinue('');
          }}
          onSuccess={(newPpaId) => {
            setShowContinueDialog(false);
            setSelectedPeriodForContinue('');
            router.push(`/ppa/${newPpaId}`);
          }}
          periods={periods}
          assignments={assignmentsForContinue}
          teachers={isAdmin ? teachers : undefined}
          onPeriodChange={setSelectedPeriodForContinue}
        />
      </div>
    </div>
  );
}
