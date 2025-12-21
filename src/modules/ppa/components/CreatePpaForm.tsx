/**
 * Formulario para crear nuevos PPAs
 * Componente dedicado que sigue el principio Single Responsibility
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { TeacherAssignmentDto } from '@/modules/teacherAssignments';
import { createPpaSchema, type CreatePpaFormData } from '../schemas/ppa.schemas';

interface CreatePpaFormProps {
  /** Períodos académicos disponibles */
  periods: Array<{ id: string; name: string; code?: string | null }>;
  /** Asignaciones docentes disponibles para el período seleccionado */
  assignments: Array<TeacherAssignmentDto>;
  /** Callback al enviar el formulario */
  onSubmit: (data: CreatePpaFormData) => void | Promise<void>;
  /** Callback al cancelar */
  onCancel: () => void;
  /** Estado de envío */
  isSubmitting?: boolean;
}

export function CreatePpaForm({
  periods,
  assignments,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CreatePpaFormProps) {
  const [studentNames, setStudentNames] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePpaFormData>({
    resolver: zodResolver(createPpaSchema),
    defaultValues: {
      title: '',
      description: '',
      generalObjective: '',
      specificObjectives: '',
      academicPeriodId: '',
      teacherAssignmentIds: [],
      studentNames: [],
    },
  });

  const selectedPeriod = watch('academicPeriodId');
  const selectedAssignments = watch('teacherAssignmentIds') || [];

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

  const handleFormSubmit = (data: CreatePpaFormData) => {
    // Filtrar nombres vacíos antes de enviar
    const filteredStudents = studentNames.filter(name => name.trim() !== '');
    onSubmit({
      ...data,
      studentNames: filteredStudents,
    });
  };

  const toggleAssignment = (assignmentId: string) => {
    const current = selectedAssignments;
    if (current.includes(assignmentId)) {
      setValue(
        'teacherAssignmentIds',
        current.filter((id) => id !== assignmentId)
      );
    } else {
      setValue('teacherAssignmentIds', [...current, assignmentId]);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
              disabled={isSubmitting}
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
            {errors.academicPeriodId && (
              <p className="text-sm text-[#e30513] mt-1">
                {errors.academicPeriodId.message}
              </p>
            )}
          </div>

          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Serás asignado automáticamente como el docente
              responsable de este PPA.
            </p>
          </div>

          {/* Asignaciones docentes */}
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
            {errors.teacherAssignmentIds && (
              <p className="text-sm text-[#e30513] mt-1">
                {errors.teacherAssignmentIds.message}
              </p>
            )}
            <p className="text-xs text-[#3c3c3b]/60 mt-1">
              Seleccionadas: {selectedAssignments.length}
            </p>
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
                  disabled={isSubmitting}
                />
                {studentNames.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeStudentField(index)}
                    disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="w-full border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Estudiante
          </Button>

          <p className="text-xs text-[#3c3c3b]/60">
            Agregue los nombres de los estudiantes participantes (opcional)
          </p>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-[#3c3c3b]/30 text-[#3c3c3b] hover:bg-[#3c3c3b]/5"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#e30513] hover:bg-[#9c0f06] text-white font-semibold rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Crear PPA
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
