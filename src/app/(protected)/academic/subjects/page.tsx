/**
 * Página de gestión de asignaturas/materias
 * Ruta: /academic/subjects
 *
 * Permite a los administradores gestionar las asignaturas del sistema
 */

'use client';

import { useState } from 'react';
import { BookOpen, Plus, Loader2, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubjects,
  createSubject,
  activateSubject,
  deactivateSubject,
} from '@/modules/academic';
import type { SubjectDto, CreateSubjectCommand } from '@/modules/academic';
import { SubjectCard } from '@/modules/academic/components/SubjectCard';
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

export default function SubjectsPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });

  // Queries
  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getSubjects(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (command: CreateSubjectCommand) => createSubject(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsCreating(false);
      resetForm();
      alert('Asignatura creada correctamente');
    },
    onError: () => {
      alert('Error al crear asignatura');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      alert('Asignatura activada');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      alert('Asignatura desactivada');
    },
  });

  // Verificar admin
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  // Handlers
  const resetForm = () => {
    setFormData({ code: '', name: '', description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      alert('Código y nombre son obligatorios');
      return;
    }

    createMutation.mutate({
      code: formData.code,
      name: formData.name,
      description: formData.description || null,
    });
  };

  const handleToggleActive = (subject: SubjectDto) => {
    if (subject.isActive) {
      if (confirm(`¿Desactivar la asignatura "${subject.name}"?`)) {
        deactivateMutation.mutate(subject.id);
      }
    } else {
      if (confirm(`¿Activar la asignatura "${subject.name}"?`)) {
        activateMutation.mutate(subject.id);
      }
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

  // Filter subjects
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && subject.isActive) ||
      (statusFilter === 'inactive' && !subject.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#630b00]">Asignaturas</h1>
                <p className="text-[#3c3c3b]/60">
                  Gestión de asignaturas/materias del sistema
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-[#e30513] hover:bg-[#9c0f06] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? 'Cancelar' : 'Nueva Asignatura'}
            </Button>
          </div>
        </div>

        {/* Formulario de creación */}
        {isCreating && (
          <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#630b00]">
                Crear Nueva Asignatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code" className="text-[#3c3c3b] font-medium">
                      Código *
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                      placeholder="Ej: MAT101"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-[#3c3c3b] font-medium">
                      Nombre *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                      placeholder="Ej: Matemáticas I"
                      maxLength={200}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-[#3c3c3b] font-medium">
                    Descripción
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-[#3c3c3b]/20 rounded-md focus:outline-none focus:border-[#e30513] min-h-[100px]"
                    placeholder="Descripción de la asignatura (opcional)"
                    maxLength={1000}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-[#e30513] hover:bg-[#9c0f06] text-white"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Asignatura'
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

        {/* Filtros */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e30513]/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search" className="text-[#3c3c3b] font-medium mb-2">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3c3c3b]/40" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar por código, nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#3c3c3b]/20 focus:border-[#e30513]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="text-[#3c3c3b] font-medium mb-2">
                Estado
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as 'all' | 'active' | 'inactive')
                }
              >
                <SelectTrigger
                  id="status"
                  className="border-[#3c3c3b]/20 focus:border-[#e30513]"
                >
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las asignaturas</SelectItem>
                  <SelectItem value="active">Solo activas</SelectItem>
                  <SelectItem value="inactive">Solo inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#3c3c3b]/10">
            <p className="text-sm text-[#3c3c3b]/70">
              Mostrando{' '}
              <span className="font-semibold text-[#630b00]">
                {filteredSubjects.length}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-[#630b00]">{subjects.length}</span>{' '}
              {subjects.length === 1 ? 'asignatura' : 'asignaturas'}
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#e30513]" />
            <div>
              <p className="font-medium mb-1">Error al cargar asignaturas</p>
              <p className="text-sm text-[#3c3c3b]/70">
                No se pudieron cargar las asignaturas. Intenta recargar la página.
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#e30513] mx-auto" />
              <p className="mt-3 text-sm text-[#3c3c3b]/60">
                Cargando asignaturas...
              </p>
            </div>
          </div>
        )}

        {/* Lista de asignaturas */}
        {!isLoading && !error && (
          <>
            {filteredSubjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20 py-12">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#3c3c3b]/30" />
                  <h3 className="text-lg font-medium text-[#630b00] mb-2">
                    No se encontraron asignaturas
                  </h3>
                  <p className="text-sm text-[#3c3c3b]/60">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Aún no hay asignaturas en el sistema'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject) => (
                  <div key={subject.id} className="relative">
                    <SubjectCard subject={subject} />
                    <div className="mt-2 flex gap-2">
                      <Button
                        onClick={() => handleToggleActive(subject)}
                        size="sm"
                        variant="outline"
                        className={
                          subject.isActive
                            ? 'border-orange-300 text-orange-700 hover:bg-orange-50 flex-1'
                            : 'border-green-300 text-green-700 hover:bg-green-50 flex-1'
                        }
                        disabled={
                          activateMutation.isPending || deactivateMutation.isPending
                        }
                      >
                        {subject.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
