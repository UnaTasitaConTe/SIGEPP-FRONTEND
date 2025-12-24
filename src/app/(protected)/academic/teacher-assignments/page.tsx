/**
 * Página de gestión de asignaciones docente-materia-período
 * Ruta: /academic/teacher-assignments
 *
 * Permite a los administradores asignar docentes a materias en períodos específicos
 */

'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Loader2, AlertCircle, Filter } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers } from '@/modules/users';
import { getSubjects, getAcademicPeriods } from '@/modules/academic';
import {
  useAssignTeacher,
  useActivateAssignment,
  useDeactivateAssignment,
  useDeleteAssignment,
} from '@/modules/teacherAssignments';
import type { AssignTeacherCommand } from '@/modules/teacherAssignments';
import { usePagedTeacherAssignments } from '@/modules/teacherAssignments/hooks/usePagedTeacherAssignments';
import { AssignmentCard } from '@/modules/teacherAssignments/components/AssignmentCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TeacherAssignmentsPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    academicPeriodId: '',
  });

  // Paginación - solo si hay período seleccionado
  const { data, loading, error, setPage, setFilters, refetch } = usePagedTeacherAssignments({
    pageSize: 12,
    academicPeriodId: selectedPeriodId || undefined,
  });

  // Actualizar filtro cuando cambia el período
  useEffect(() => {
    if (selectedPeriodId) {
      setFilters({ academicPeriodId: selectedPeriodId });
    }
  }, [selectedPeriodId, setFilters]);

  // Queries
  const { data: periods = [] } = useQuery({
    queryKey: ['academic-periods'],
    queryFn: () => getAcademicPeriods(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getSubjects(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  // Mutations
  const assignMutation = useAssignTeacher();
  const activateMutation = useActivateAssignment();
  const deactivateMutation = useDeactivateAssignment();
  const deleteMutation = useDeleteAssignment();

  // Verificar admin
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  // Filtrar solo docentes
  const teachers = users.filter((u) => u.roles?.includes('DOCENTE'));

  // Handlers
  const resetForm = () => {
    setFormData({
      teacherId: '',
      subjectId: '',
      academicPeriodId: selectedPeriodId || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teacherId || !formData.subjectId || !formData.academicPeriodId) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const command: AssignTeacherCommand = {
      teacherId: formData.teacherId,
      subjectId: formData.subjectId,
      academicPeriodId: formData.academicPeriodId,
    };

    assignMutation.mutate(command, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
        refetch();
        setIsCreating(false);
        resetForm();
        alert('Asignación creada correctamente');
      },
      onError: () => {
        alert('Error al crear asignación. Verifica que no exista ya.');
      },
    });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    if (isActive) {
      if (confirm('¿Desactivar esta asignación?')) {
        deactivateMutation.mutate(id, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
            refetch();
          },
        });
      }
    } else {
      if (confirm('¿Activar esta asignación?')) {
        activateMutation.mutate(id, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
            refetch();
          },
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar permanentemente esta asignación? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
          refetch();
          alert('Asignación eliminada');
        },
      });
    }
  };

  // Loading
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

  // Check admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Acceso no autorizado</h3>
              <p className="text-sm text-[#3c3c3b]/70">
                Solo los administradores pueden acceder a esta página.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#630b00]">
                  Asignaciones Docente
                </h1>
                <p className="text-[#3c3c3b]/60">
                  Gestión de asignaciones docente-materia-período
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-[#e30513] hover:bg-[#9c0f06] text-white"
              disabled={!selectedPeriodId}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? 'Cancelar' : 'Nueva Asignación'}
            </Button>
          </div>
        </div>

        {/* Formulario de creación */}
        {isCreating && (
          <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#630b00]">
                Crear Nueva Asignación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="period" className="text-[#3c3c3b] font-medium">
                      Período Académico *
                    </Label>
                    <Select
                      value={formData.academicPeriodId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, academicPeriodId: value })
                      }
                    >
                      <SelectTrigger
                        id="period"
                        className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                      >
                        <SelectValue placeholder="Selecciona período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name}
                            {period.isActive && (
                              <span className="ml-2 text-xs text-green-600">(Activo)</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="teacher" className="text-[#3c3c3b] font-medium">
                      Docente *
                    </Label>
                    <Select
                      value={formData.teacherId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, teacherId: value })
                      }
                    >
                      <SelectTrigger
                        id="teacher"
                        className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                      >
                        <SelectValue placeholder="Selecciona docente" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-[#3c3c3b] font-medium">
                      Asignatura *
                    </Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subjectId: value })
                      }
                    >
                      <SelectTrigger
                        id="subject"
                        className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                      >
                        <SelectValue placeholder="Selecciona asignatura" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.code} - {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={assignMutation.isPending}
                    className="bg-[#e30513] hover:bg-[#9c0f06] text-white"
                  >
                    {assignMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Asignación'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filtro de período */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e30513]/20 mb-6">
          <div className="max-w-md">
            <Label htmlFor="periodFilter" className="text-[#3c3c3b] font-medium mb-2 flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#e30513]" />
              Filtrar por Período Académico
            </Label>
            <Select
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
            >
              <SelectTrigger
                id="periodFilter"
                className="mt-2 border-[#3c3c3b]/20 focus:border-[#e30513]"
              >
                <SelectValue placeholder="Selecciona un período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                    {period.isActive && (
                      <span className="ml-2 text-xs text-green-600">(Activo)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPeriodId && data && (
            <div className="mt-4 pt-4 border-t border-[#3c3c3b]/10">
              <PaginationInfo
                currentPage={data.page}
                pageSize={data.pageSize}
                totalItems={data.totalItems}
              />
            </div>
          )}
        </div>

        {/* Sin período seleccionado */}
        {!selectedPeriodId && (
          <div className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20 py-12">
            <div className="text-center">
              <Filter className="h-16 w-16 mx-auto mb-4 text-[#3c3c3b]/30" />
              <h3 className="text-lg font-medium text-[#630b00] mb-2">
                Selecciona un Período Académico
              </h3>
              <p className="text-sm text-[#3c3c3b]/60">
                Selecciona un período para ver sus asignaciones
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {selectedPeriodId && error && (
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#e30513]" />
            <div>
              <p className="font-medium mb-1">Error al cargar asignaciones</p>
              <p className="text-sm text-[#3c3c3b]/70">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {selectedPeriodId && loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#e30513] mx-auto" />
              <p className="mt-3 text-sm text-[#3c3c3b]/60">
                Cargando asignaciones...
              </p>
            </div>
          </div>
        )}

        {/* Lista de asignaciones */}
        {selectedPeriodId && !loading && !error && data && (
          <>
            {data.items.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20 py-12">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-[#3c3c3b]/30" />
                  <h3 className="text-lg font-medium text-[#630b00] mb-2">
                    No hay asignaciones
                  </h3>
                  <p className="text-sm text-[#3c3c3b]/60">
                    No hay asignaciones para este período académico
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {data.items.map((assignment) => (
                    <div key={assignment.id} className="relative">
                      <AssignmentCard assignment={assignment} />
                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={() =>
                            handleToggleActive(assignment.id, assignment.isActive)
                          }
                          size="sm"
                          variant="outline"
                          className={
                            assignment.isActive
                              ? 'border-orange-300 text-orange-700 hover:bg-orange-50 flex-1'
                              : 'border-green-300 text-green-700 hover:bg-green-50 flex-1'
                          }
                          disabled={
                            activateMutation.isPending || deactivateMutation.isPending
                          }
                        >
                          {assignment.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          onClick={() => handleDelete(assignment.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          disabled={deleteMutation.isPending}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  hasPrevious={data.hasPreviousPage}
                  hasNext={data.hasNextPage}
                  onPageChange={setPage}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
