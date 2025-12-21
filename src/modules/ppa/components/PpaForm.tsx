/**
 * Formulario reutilizable para crear/editar PPAs
 * Incluye validación con zod alineada con OpenAPI
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { PpaDetailDto } from '../types';
import { TeacherAssignmentDto } from '@/modules/teacherAssignments';
import { createPpaSchema, updatePpaSchema } from '../schemas/ppa.schemas';
import { useState } from 'react';

// Schema de validación para modo creación (sin primaryTeacherId, con studentNames)
const createFormSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(300, 'El título no puede exceder 300 caracteres'),
  description: z
    .string()
    .max(3000, 'La descripción no puede exceder 3000 caracteres')
    .optional()
    .nullable(),
  generalObjective: z
    .string()
    .max(1000, 'El objetivo general no puede exceder 1000 caracteres')
    .optional()
    .nullable(),
  specificObjectives: z
    .string()
    .max(2000, 'Los objetivos específicos no pueden exceder 2000 caracteres')
    .optional()
    .nullable(),
  academicPeriodId: z.string().min(1, 'Selecciona un período académico'),
  teacherAssignmentIds: z
    .array(z.string())
    .min(1, 'Selecciona al menos una asignación docente'),
  studentNames: z.array(z.string()).optional(),
});

// Schema para modo edición
const editFormSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(300, 'El título no puede exceder 300 caracteres'),
  description: z
    .string()
    .max(3000, 'La descripción no puede exceder 3000 caracteres')
    .optional()
    .nullable(),
  generalObjective: z
    .string()
    .max(1000, 'El objetivo general no puede exceder 1000 caracteres')
    .optional()
    .nullable(),
  specificObjectives: z
    .string()
    .max(2000, 'Los objetivos específicos no pueden exceder 2000 caracteres')
    .optional()
    .nullable(),
  newResponsibleTeacherId: z.string().optional().nullable(),
  newTeacherAssignmentIds: z.array(z.string()).optional().nullable(),
  newStudentNames: z.array(z.string()).optional().nullable(),
});

// Tipos derivados de los schemas
export type CreatePpaFormData = z.infer<typeof createFormSchema>;
export type UpdatePpaFormData = z.infer<typeof editFormSchema>;
export type PpaFormData = CreatePpaFormData | UpdatePpaFormData;

// Props base compartidas
interface PpaFormBaseProps {
  /** Períodos académicos disponibles */
  periods: Array<{ id: string; name: string; code?: string | null }>;
  /** Docentes disponibles */
  teachers: Array<{ id: string; name: string }>;
  /** Asignaciones docentes disponibles para el período seleccionado */
  assignments: Array<TeacherAssignmentDto>;
  /** Callback al cancelar */
  onCancel: () => void;
  /** Estado de envío */
  isSubmitting?: boolean;
}

// Props para modo creación
interface PpaFormCreateProps extends PpaFormBaseProps {
  mode: 'create';
  initialData?: never;
  onSubmit: (data: CreatePpaFormData) => void | Promise<void>;
}

// Props para modo edición
interface PpaFormEditProps extends PpaFormBaseProps {
  mode: 'edit';
  initialData: PpaDetailDto;
  onSubmit: (data: UpdatePpaFormData) => void | Promise<void>;
}

// Tipo unión de props
type PpaFormProps = PpaFormCreateProps | PpaFormEditProps;

export function PpaForm({
  initialData,
  periods,
  teachers,
  assignments,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
}: PpaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PpaFormData>({
    resolver: zodResolver(mode === 'create' ? createFormSchema : editFormSchema),
    defaultValues:
      mode === 'create'
        ? {
            title: '',
            description: '',
            generalObjective: '',
            specificObjectives: '',
            academicPeriodId: '',
            teacherAssignmentIds: [],
            studentNames: [],
          }
        : {
            id: initialData?.id || '',
            title: initialData?.title || '',
            description: initialData?.description || '',
            generalObjective: initialData?.generalObjective || '',
            specificObjectives: initialData?.specificObjectives || '',
            newResponsibleTeacherId: null,
            newTeacherAssignmentIds: null,
            newStudentNames: null,
          },
  });

  const selectedPeriod = mode === 'create' ? watch('academicPeriodId' as any) : '';
  const selectedAssignments =
    mode === 'create'
      ? (watch('teacherAssignmentIds' as any) as string[] | undefined) || []
      : (watch('newTeacherAssignmentIds' as any) as string[] | null | undefined) || initialData?.teacherAssignmentIds || [];

  const toggleAssignment = (assignmentId: string) => {
    const current = selectedAssignments;
    const fieldName = mode === 'create' ? 'teacherAssignmentIds' : 'newTeacherAssignmentIds';
    if (current.includes(assignmentId)) {
      setValue(
        fieldName as any,
        current.filter((id) => id !== assignmentId)
      );
    } else {
      setValue(fieldName as any, [...current, assignmentId]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información básica */}
      <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#630b00]">
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="title" className="text-[#3c3c3b] font-medium">
              Título del PPA *
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ej: Plan de Preparación Académica 2024-1"
              className={`mt-1 border-[#3c3c3b]/20 focus:border-[#e30513] ${
                errors.title ? 'border-[#e30513]' : ''
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-[#e30513] mt-1">{errors.title.message}</p>
            )}
            <p className="text-xs text-[#3c3c3b]/60 mt-1">
              3-300 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description" className="text-[#3c3c3b] font-medium">
              Descripción
            </Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Descripción general del PPA..."
              className={`mt-1 w-full px-3 py-2 border border-[#3c3c3b]/20 rounded-md focus:outline-none focus:border-[#e30513] min-h-[100px] ${
                errors.description ? 'border-[#e30513]' : ''
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-[#e30513] mt-1">
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-[#3c3c3b]/60 mt-1">
              Máximo 3000 caracteres
            </p>
          </div>

          {/* Objetivo general */}
          <div>
            <Label
              htmlFor="generalObjective"
              className="text-[#3c3c3b] font-medium"
            >
              Objetivo General
            </Label>
            <textarea
              id="generalObjective"
              {...register('generalObjective')}
              placeholder="Objetivo general del PPA..."
              className={`mt-1 w-full px-3 py-2 border border-[#3c3c3b]/20 rounded-md focus:outline-none focus:border-[#e30513] min-h-[80px] ${
                errors.generalObjective ? 'border-[#e30513]' : ''
              }`}
              disabled={isSubmitting}
            />
            {errors.generalObjective && (
              <p className="text-sm text-[#e30513] mt-1">
                {errors.generalObjective.message}
              </p>
            )}
            <p className="text-xs text-[#3c3c3b]/60 mt-1">
              Máximo 1000 caracteres
            </p>
          </div>

          {/* Objetivos específicos */}
          <div>
            <Label
              htmlFor="specificObjectives"
              className="text-[#3c3c3b] font-medium"
            >
              Objetivos Específicos
            </Label>
            <textarea
              id="specificObjectives"
              {...register('specificObjectives')}
              placeholder="Objetivos específicos del PPA (uno por línea)..."
              className={`mt-1 w-full px-3 py-2 border border-[#3c3c3b]/20 rounded-md focus:outline-none focus:border-[#e30513] min-h-[120px] ${
                errors.specificObjectives ? 'border-[#e30513]' : ''
              }`}
              disabled={isSubmitting}
            />
            {errors.specificObjectives && (
              <p className="text-sm text-[#e30513] mt-1">
                {errors.specificObjectives.message}
              </p>
            )}
            <p className="text-xs text-[#3c3c3b]/60 mt-1">
              Máximo 2000 caracteres
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Asignaciones */}
      <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#630b00]">
            Asignaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Período académico */}
          <div>
            <Label htmlFor="period" className="text-[#3c3c3b] font-medium">
              Período Académico *
            </Label>
            <Select
              value={selectedPeriod}
              onValueChange={(value) => setValue('academicPeriodId', value)}
              disabled={isSubmitting || mode === 'edit'}
            >
              <SelectTrigger
                id="period"
                className={`mt-1 border-[#3c3c3b]/20 focus:border-[#e30513] ${
                  errors.academicPeriodId ? 'border-[#e30513]' : ''
                }`}
              >
                <SelectValue placeholder="Selecciona un período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {'academicPeriodId' in errors && errors.academicPeriodId && (
              <p className="text-sm text-[#e30513] mt-1">
                {errors.academicPeriodId?.message}
              </p>
            )}
            {mode === 'edit' && (
              <p className="text-xs text-[#3c3c3b]/60 mt-1">
                El período no puede modificarse en modo edición
              </p>
            )}
          </div>

          {/* Docente responsable - Solo en modo edición */}
          {mode === 'edit' && (
            <div>
              <Label htmlFor="newResponsibleTeacherId" className="text-[#3c3c3b] font-medium">
                Cambiar Docente Responsable (Opcional)
              </Label>
              <Select
                value={watch('newResponsibleTeacherId') || ''}
                onValueChange={(value) =>
                  setValue('newResponsibleTeacherId', value || null)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="newResponsibleTeacherId"
                  className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                >
                  <SelectValue placeholder="Mantener responsable actual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Mantener responsable actual</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#3c3c3b]/60 mt-1">
                Responsable actual: {initialData?.primaryTeacherName || 'N/A'}
              </p>
            </div>
          )}

          {mode === 'create' && (
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Serás asignado automáticamente como el docente
                responsable de este PPA.
              </p>
            </div>
          )}

          {/* Asignaciones docentes */}
          {mode === 'create' && (
            <div>
              <Label className="text-[#3c3c3b] font-medium">
                Asignaciones Docentes * (mínimo 1)
              </Label>
              {assignments.length === 0 ? (
                <p className="text-sm text-[#3c3c3b]/60 mt-2">
                  No hay asignaciones disponibles para este período
                </p>
              ) : (
                <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto border border-[#3c3c3b]/20 rounded-md p-3">
                  {assignments.map((assignment) => (
                    <label
                      key={assignment.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f2f2f2] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssignments.includes(assignment.id)}
                        onChange={() => toggleAssignment(assignment.id)}
                        className="h-4 w-4 text-[#e30513] rounded border-[#3c3c3b]/30 focus:ring-[#e30513]"
                        disabled={isSubmitting}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#630b00]">
                          {assignment.subjectCode} - {assignment.subjectName}
                        </p>
                        {assignment.teacherName && (
                          <p className="text-xs text-[#3c3c3b]/60">
                            {assignment.teacherName}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {'teacherAssignmentIds' in errors && errors.teacherAssignmentIds && (
                <p className="text-sm text-[#e30513] mt-1">
                  {errors.teacherAssignmentIds?.message}
                </p>
              )}
              <p className="text-xs text-[#3c3c3b]/60 mt-1">
                Seleccionadas: {selectedAssignments.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estudiantes */}
      <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#630b00]">
            Estudiantes (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="studentNames" className="text-[#3c3c3b] font-medium">
              Nombres de Estudiantes
            </Label>
            <textarea
              id="studentNames"
              placeholder="Ingrese nombres de estudiantes (uno por línea)"
              className="mt-1 w-full px-3 py-2 border border-[#3c3c3b]/20 rounded-md focus:outline-none focus:border-[#e30513] min-h-[100px]"
              disabled={isSubmitting}
              defaultValue={
                mode === 'create'
                  ? ''
                  : initialData
                  ? []
                      .join('\n')
                  : ''
              }
              onChange={(e) => {
                const names = e.target.value
                  .split('\n')
                  .map((n) => n.trim())
                  .filter(Boolean);
                setValue(
                  mode === 'create' ? 'studentNames' : 'newStudentNames',
                  names.length > 0 ? names : undefined
                );
              }}
            />
            <p className="text-xs text-[#3c3c3b]/60 mt-1">
              Un nombre por línea
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-[#3c3c3b]/20 text-[#3c3c3b] hover:bg-[#f2f2f2]"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#e30513] hover:bg-[#9c0f06] text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creando...' : 'Guardando...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Crear PPA' : 'Guardar Cambios'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
