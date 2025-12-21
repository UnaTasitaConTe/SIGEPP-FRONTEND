/**
 * Formulario completo de edición de PPAs para ADMINISTRADOR
 * Permite editar todos los aspectos del PPA incluyendo:
 * - Información básica (título, descripción, objetivos)
 * - Docente responsable
 * - Asignaciones docentes
 * - Estudiantes (agregar nuevos, sin eliminar existentes)
 */

'use client';

import { useState, useEffect } from 'react';
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
import type { PpaDetailDto } from '../types';
import { TeacherAssignmentDto } from '@/modules/teacherAssignments';
import { updatePpaSchema, type UpdatePpaFormData } from '../schemas/ppa.schemas';

interface AdminEditPpaFormProps {
  /** Datos del PPA a editar */
  ppa: PpaDetailDto;
  /** Docentes disponibles */
  teachers: Array<{ id: string; name: string }>;
  /** Asignaciones docentes disponibles para el período */
  assignments: Array<TeacherAssignmentDto>;
  /** Callback al enviar el formulario */
  onSubmit: (data: UpdatePpaFormData) => void | Promise<void>;
  /** Callback al cancelar */
  onCancel: () => void;
  /** Estado de envío */
  isSubmitting?: boolean;
}

export function AdminEditPpaForm({
  ppa,
  teachers,
  assignments,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AdminEditPpaFormProps) {
  // Estado para docente responsable
  const [newResponsibleTeacherId, setNewResponsibleTeacherId] = useState<string>('');

  // Estado para asignaciones docentes
  const [newTeacherAssignmentIds, setNewTeacherAssignmentIds] = useState<string[]>([]);

  // Estado para estudiantes: separamos existentes de nuevos
  const [existingStudents, setExistingStudents] = useState<Array<{ id?: string | null; name: string }>>([]);
  const [newStudents, setNewStudents] = useState<Array<{ id?: string | null; name: string }>>([]);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Inicializar estados
  useEffect(() => {
    // Asignaciones actuales
    setNewTeacherAssignmentIds(ppa.teacherAssignmentIds || []);

    // Cargar estudiantes existentes desde ppa.students
    if (ppa.students && ppa.students.length > 0) {
      setExistingStudents(ppa.students);
    } else {
      setExistingStudents([]);
    }
    setNewStudents([{ name: '' }]); // Siempre al menos un campo para agregar
  }, [ppa.id, ppa.teacherAssignmentIds, ppa.students]);

  // Validar duplicados cuando cambian los estudiantes
  useEffect(() => {
    const allNames = [
      ...existingStudents.map(s => s.name.trim().toLowerCase()),
      ...newStudents.map(s => s.name.trim().toLowerCase()).filter(n => n !== '')
    ];

    const duplicates = allNames.filter((name, index) => allNames.indexOf(name) !== index);

    if (duplicates.length > 0) {
      setDuplicateError(`Nombres duplicados encontrados. Cada estudiante debe tener un nombre único.`);
    } else {
      setDuplicateError(null);
    }
  }, [existingStudents, newStudents]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePpaFormData>({
    resolver: zodResolver(updatePpaSchema),
    defaultValues: {
      id: ppa.id,
      title: ppa.title,
      description: ppa.description || '',
      generalObjective: ppa.generalObjective || '',
      specificObjectives: ppa.specificObjectives || '',
      newResponsibleTeacherId: null,
      newTeacherAssignmentIds: null,
      newStudents: null,
    },
  });

  const addStudentField = () => {
    setNewStudents([...newStudents, { name: '' }]);
  };

  const removeNewStudentField = (index: number) => {
    setNewStudents(newStudents.filter((_, i) => i !== index));
  };

  const updateNewStudentName = (index: number, value: string) => {
    const updated = [...newStudents];
    updated[index] = { ...updated[index], name: value };
    setNewStudents(updated);
  };

  const removeExistingStudent = (index: number) => {
    setExistingStudents(existingStudents.filter((_, i) => i !== index));
  };

  const toggleAssignment = (assignmentId: string) => {
    if (newTeacherAssignmentIds.includes(assignmentId)) {
      setNewTeacherAssignmentIds(newTeacherAssignmentIds.filter(id => id !== assignmentId));
    } else {
      setNewTeacherAssignmentIds([...newTeacherAssignmentIds, assignmentId]);
    }
  };

  const handleFormSubmit = (data: UpdatePpaFormData) => {
    // Validar que no haya duplicados antes de enviar
    if (duplicateError) {
      alert('No se puede guardar: hay nombres de estudiantes duplicados. Por favor, corrígelos antes de continuar.');
      return;
    }

    // Combinar estudiantes existentes con los nuevos (filtrar nombres vacíos)
    const filteredNewStudents = newStudents.filter(student => student.name.trim() !== '');
    const allStudents = [...existingStudents, ...filteredNewStudents];

    // Determinar si hubo cambios en asignaciones
    const assignmentsChanged = JSON.stringify(newTeacherAssignmentIds.sort()) !==
                                JSON.stringify((ppa.teacherAssignmentIds || []).sort());

    onSubmit({
      ...data,
      newResponsibleTeacherId: newResponsibleTeacherId || null,
      newTeacherAssignmentIds: assignmentsChanged ? newTeacherAssignmentIds : null,
      newStudents: allStudents.length > 0 ? allStudents : null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Información básica */}
      <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#630b00]">
            Editar Información del PPA
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

      {/* Responsable y Asignaciones - ADMIN puede modificar */}
      <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#630b00]">
            Responsable y Asignaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Período académico (solo lectura) */}
          <div>
            <Label className="text-[#3c3c3b]/60 text-xs">Período Académico (no editable)</Label>
            <p className="text-sm text-[#3c3c3b] font-medium mt-1">
              {ppa.academicPeriodCode || ppa.academicPeriodId}
            </p>
          </div>

          {/* Docente responsable actual */}
          <div>
            <Label className="text-[#3c3c3b] font-medium">
              Docente Responsable Actual
            </Label>
            <p className="text-sm text-[#3c3c3b] font-medium mt-1 mb-2">
              {ppa.primaryTeacherName || 'Sin asignar'}
            </p>
          </div>

          {/* Cambiar docente responsable */}
          <div>
            <Label htmlFor="newResponsibleTeacher" className="text-[#3c3c3b] font-medium">
              Cambiar Docente Responsable (Opcional)
            </Label>
            <Select
              value={newResponsibleTeacherId}
              onValueChange={setNewResponsibleTeacherId}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="newResponsibleTeacher"
                className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
              >
                <SelectValue  placeholder="Mantener responsable actual" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#3c3c3b]/60 mt-1">
              Deja vacío para mantener el responsable actual
            </p>
          </div>

          {/* Asignaciones docentes */}
          <div>
            <Label className="text-[#3c3c3b] font-medium">
              Asignaciones Docentes
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
                      checked={newTeacherAssignmentIds.includes(assignment.id)}
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
            <p className="text-xs text-[#3c3c3b]/60 mt-1">
              Seleccionadas: {newTeacherAssignmentIds.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estudiantes */}
      <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#630b00]">
            Estudiantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mensaje de error por duplicados */}
          {duplicateError && (
            <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-4 py-3 rounded-lg flex items-start gap-2">
              <X className="h-5 w-5 flex-shrink-0 text-[#e30513]" />
              <p className="text-sm">{duplicateError}</p>
            </div>
          )}

          {/* Estudiantes existentes - El admin SÍ puede eliminarlos */}
          {existingStudents.length > 0 && (
            <div>
              <Label className="text-[#3c3c3b] font-medium mb-2 block">
                Estudiantes Registrados
              </Label>
              <div className="space-y-2">
                {existingStudents.map((student, index) => (
                  <div key={student.id || `existing-${index}`} className="flex items-center gap-2">
                    <Input
                      value={student.name}
                      disabled
                      className="flex-1 border-[#3c3c3b]/20 bg-gray-50 cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeExistingStudent(index)}
                      disabled={isSubmitting}
                      className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
                      title="Eliminar estudiante"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#3c3c3b]/60 mt-2">
                Como administrador, puedes eliminar estudiantes existentes
              </p>
            </div>
          )}

          {/* Nuevos estudiantes - se pueden agregar/eliminar */}
          <div>
            <Label className="text-[#3c3c3b] font-medium mb-2 block">
              Agregar Nuevos Estudiantes
            </Label>
            <div className="space-y-2">
              {newStudents.map((student, index) => (
                <div key={`new-${index}`} className="flex items-center gap-2">
                  <Input
                    value={student.name}
                    onChange={(e) => updateNewStudentName(index, e.target.value)}
                    placeholder={`Nuevo estudiante ${index + 1}`}
                    className="flex-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                    disabled={isSubmitting}
                  />
                  {newStudents.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeNewStudentField(index)}
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
              className="w-full mt-3 border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Otro Estudiante
            </Button>

            <p className="text-xs text-[#3c3c3b]/60 mt-2">
              Agregue nuevos estudiantes al PPA (opcional)
            </p>
          </div>
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
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
