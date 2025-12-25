/**
 * Diálogo para continuar un PPA en un nuevo período académico
 * Basado en la estructura de CreatePpaForm para mejor UX
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, GitBranch, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useContinuePpa } from '../hooks/usePpa';
import { continuePpaSchema, type ContinuePpaFormData } from '../schemas/ppa.schemas';
import type { PpaSummaryDto } from '../types';
import { usePagedTeacherAssignments } from '@/modules/teacherAssignments/hooks/usePagedTeacherAssignments';
import { AcademicPeriodCombobox } from './AcademicPeriodCombobox';
import { TeacherCombobox } from './TeacherCombobox';
import { TeacherAssignmentPaginatedMultiSelect } from './TeacherAssignmentPaginatedMultiSelect';

interface ContinuePpaDialogProps {
  ppa: PpaSummaryDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPpaId: string) => void;
  /** Períodos académicos disponibles */
  periods: Array<{ id: string; name: string; code?: string | null }>;
}

export function ContinuePpaDialog({
  ppa,
  isOpen,
  onClose,
  onSuccess,
  periods,
}: ContinuePpaDialogProps) {
  const [studentNames, setStudentNames] = useState<string[]>(['']);
  const [selectedResponsibleTeacher, setSelectedResponsibleTeacher] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ContinuePpaFormData>({
    resolver: zodResolver(continuePpaSchema),
    defaultValues: {
      sourcePpaId: ppa.id,
      targetAcademicPeriodId: '',
      newTitle: '',
      newResponsibleTeacherId: null,
      teacherAssignmentIds: [],
      studentNames: [],
    },
  });

  const { mutate: continuePpa, isPending } = useContinuePpa();

  const selectedPeriod = watch('targetAcademicPeriodId');
  const selectedAssignments = watch('teacherAssignmentIds') || [];

  // Obtener asignaciones del período para extraer docentes únicos
  const { data: assignmentsData, setFilters } = usePagedTeacherAssignments({
    pageSize: 100,
    academicPeriodId: selectedPeriod || '',
  });

  // Actualizar filtro de período cuando cambia
  useEffect(() => {
    if (selectedPeriod) {
      setFilters({ academicPeriodId: selectedPeriod });
    } else {
      setFilters({ academicPeriodId: undefined });
    }
  }, [selectedPeriod, setFilters]);

  // Extraer docentes únicos de las asignaciones del período
  const eligibleTeachers = useMemo(() => {
    if (!selectedPeriod || !assignmentsData?.items) {
      return [];
    }

    const teacherMap = new Map<string, { id: string; name: string }>();
    assignmentsData.items.forEach((assignment) => {
      if (assignment.teacherId && assignment.teacherName) {
        teacherMap.set(assignment.teacherId, {
          id: assignment.teacherId,
          name: assignment.teacherName,
        });
      }
    });

    return Array.from(teacherMap.values());
  }, [selectedPeriod, assignmentsData]);

  // Reset form cuando se cierra el diálogo
  useEffect(() => {
    if (!isOpen) {
      reset();
      setStudentNames(['']);
      setSelectedResponsibleTeacher('');
    }
  }, [isOpen, reset]);

  const addStudentField = () => {
    setStudentNames([...studentNames, '']);
  };

  const removeStudentField = (index: number) => {
    setStudentNames(studentNames.filter((_, i) => i !== index));
  };

  const updateStudentName = (index: number, value: string) => {
    const updated = [...studentNames];
    updated[index] = value;
    setStudentNames(updated);
  };

  const handleFormSubmit = (data: ContinuePpaFormData) => {
    // Filtrar nombres vacíos antes de enviar
    const filteredStudents = studentNames.filter(name => name.trim() !== '');

    const payload: ContinuePpaFormData = {
      ...data,
      newResponsibleTeacherId: selectedResponsibleTeacher || null,
      studentNames: filteredStudents.length > 0 ? filteredStudents : undefined,
    };

    continuePpa(payload, {
      onSuccess: (response) => {
        onSuccess?.(response.id);
        onClose();
      },
      onError: (error: any) => {
        alert(error.message || 'Error al continuar el PPA');
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e30513]/20 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-lg flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#630b00]">
                Continuar PPA en Nuevo Período
              </h2>
              <p className="text-sm text-[#3c3c3b]/60">
                Crear continuación del PPA en un período diferente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-[#f2f2f2] transition-colors"
            disabled={isPending}
          >
            <X className="h-5 w-5 text-[#3c3c3b]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Info del PPA origen */}
          <Card className="mb-6 bg-[#f2f2f2] border-[#e30513]/20">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase">
                    PPA Original
                  </p>
                  <p className="text-sm font-semibold text-[#630b00]">
                    {ppa.title}
                  </p>
                </div>
                <div className="flex gap-4 text-xs text-[#3c3c3b]/70">
                  <div>
                    <span className="font-medium">Período:</span>{' '}
                    {ppa.academicPeriodCode || ppa.academicPeriodId}
                  </div>
                  <div>
                    <span className="font-medium">Responsable:</span>{' '}
                    {ppa.responsibleTeacherName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Asignaciones:</span>{' '}
                    {ppa.assignmentsCount}
                  </div>
                  <div>
                    <span className="font-medium">Estudiantes:</span>{' '}
                    {ppa.studentsCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Configuración básica */}
            <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#630b00]">
                  Configuración de la Continuación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Período destino */}
                <div>
                  <Label htmlFor="period" className="text-[#3c3c3b] font-medium">
                    Período Académico Destino *
                  </Label>
                  <div className="mt-1">
                    <AcademicPeriodCombobox
                      periods={periods}
                      value={selectedPeriod}
                      onValueChange={(value) => {
                        setValue('targetAcademicPeriodId', value);
                        // Limpiar asignaciones y docente responsable al cambiar período
                        setValue('teacherAssignmentIds', []);
                        setSelectedResponsibleTeacher('');
                      }}
                      disabled={isPending}
                      className={errors.targetAcademicPeriodId ? 'border-[#e30513]' : ''}
                    />
                  </div>
                  {errors.targetAcademicPeriodId && (
                    <p className="text-sm text-[#e30513] mt-1">
                      {errors.targetAcademicPeriodId.message}
                    </p>
                  )}
                  <p className="text-xs text-[#3c3c3b]/60 mt-1">
                    Período académico donde se continuará el PPA
                  </p>
                </div>

                {/* Nuevo título (opcional) */}
                <div>
                  <Label htmlFor="newTitle" className="text-[#3c3c3b] font-medium">
                    Nuevo Título (Opcional)
                  </Label>
                  <Input
                    id="newTitle"
                    {...register('newTitle')}
                    placeholder={`Dejar vacío para usar: ${ppa.title}`}
                    className={`mt-1 border-[#3c3c3b]/20 focus:border-[#e30513] ${
                      errors.newTitle ? 'border-[#e30513]' : ''
                    }`}
                    disabled={isPending}
                  />
                  {errors.newTitle && (
                    <p className="text-sm text-[#e30513] mt-1">
                      {errors.newTitle.message}
                    </p>
                  )}
                  <p className="text-xs text-[#3c3c3b]/60 mt-1">
                    Si se deja vacío, se usará el título original
                  </p>
                </div>

                {/* Nuevo responsable (opcional) */}
                <div>
                  <Label htmlFor="teacher" className="text-[#3c3c3b] font-medium">
                    Cambiar Docente Responsable (Opcional)
                  </Label>
                  {!selectedPeriod ? (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Selecciona primero un período académico
                      </p>
                    </div>
                  ) : eligibleTeachers.length === 0 ? (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        No hay docentes con asignaciones en este período
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <TeacherCombobox
                        teachers={eligibleTeachers}
                        value={selectedResponsibleTeacher}
                        onValueChange={setSelectedResponsibleTeacher}
                        disabled={isPending}
                      />
                    </div>
                  )}
                  <p className="text-xs text-[#3c3c3b]/60 mt-1">
                    Si no se especifica, se mantiene: {ppa.responsibleTeacherName}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Asignaciones docentes */}
            <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#630b00]">
                  Asignaciones Docentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Selecciona las asignaciones docentes del
                    nuevo período que formarán parte de este PPA.
                  </p>
                </div>

                <div>
                  <Label className="text-[#3c3c3b] font-medium">
                    Asignaciones * (mínimo 1)
                  </Label>
                  <div className="mt-2">
                    <TeacherAssignmentPaginatedMultiSelect
                      academicPeriodId={selectedPeriod}
                      value={selectedAssignments}
                      onValueChange={(value) => setValue('teacherAssignmentIds', value)}
                      disabled={isPending}
                      placeholder="Buscar y seleccionar asignaciones..."
                      className={errors.teacherAssignmentIds ? 'border-[#e30513]' : ''}
                    />
                  </div>
                  {errors.teacherAssignmentIds && (
                    <p className="text-sm text-[#e30513] mt-1">
                      {errors.teacherAssignmentIds.message}
                    </p>
                  )}
                  {!selectedPeriod && (
                    <p className="text-xs text-[#3c3c3b]/60 mt-1">
                      Selecciona primero un período académico
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estudiantes */}
            <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#630b00]">
                  Estudiantes (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {studentNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={name}
                        onChange={(e) => updateStudentName(index, e.target.value)}
                        placeholder={`Nombre del estudiante ${index + 1}`}
                        className="flex-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                        disabled={isPending}
                      />
                      {studentNames.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeStudentField(index)}
                          disabled={isPending}
                          className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addStudentField}
                  disabled={isPending}
                  className="w-full border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Estudiante
                </Button>

                <p className="text-xs text-[#3c3c3b]/60">
                  Agregue los nombres de los estudiantes que participarán (opcional)
                </p>
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="border-[#3c3c3b]/30 text-[#3c3c3b] hover:bg-[#3c3c3b]/5"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#e30513] hover:bg-[#9c0f06] text-white font-semibold rounded-lg transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando Continuación...
                  </>
                ) : (
                  <>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Continuar PPA
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
