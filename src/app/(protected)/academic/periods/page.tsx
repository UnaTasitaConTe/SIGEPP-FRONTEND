/**
 * Página de gestión de períodos académicos
 * Ruta: /academic/periods
 *
 * Permite a los administradores gestionar los períodos académicos del sistema
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAcademicPeriod,
  activateAcademicPeriod,
  deactivateAcademicPeriod,
} from '@/modules/academic';
import type { CreateAcademicPeriodCommand } from '@/modules/academic';
import { usePagedAcademicPeriods } from '@/modules/academic/hooks/usePagedAcademicPeriods';
import { AcademicPeriodCard } from '@/modules/academic/components/AcademicPeriodCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function AcademicPeriodsPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    startDate: '',
    endDate: '',
  });

  // Paginación
  const { data, loading, error, setPage, setSearch, setFilters, refetch } = usePagedAcademicPeriods({
    pageSize: 12,
  });

  // Actualizar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearch]);

  // Actualizar filtro de estado
  useEffect(() => {
    const filters: any = {};

    if (statusFilter === 'active') {
      filters.isActive = true;
    } else if (statusFilter === 'inactive') {
      filters.isActive = false;
    }

    setFilters(filters);
  }, [statusFilter, setFilters]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (command: CreateAcademicPeriodCommand) => createAcademicPeriod(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] });
      refetch();
      setIsCreating(false);
      resetForm();
      alert('Período académico creado correctamente');
    },
    onError: () => {
      alert('Error al crear período académico');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateAcademicPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] });
      refetch();
      alert('Período activado');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateAcademicPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] });
      refetch();
      alert('Período desactivado');
    },
  });

  // Verificar admin
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  // Handlers
  const resetForm = () => {
    setFormData({ code: '', name: '', startDate: '', endDate: '' });
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
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    });
  };

  const handleToggleActive = (period: any) => {
    if (period.isActive) {
      if (confirm(`¿Desactivar el período "${period.name}"?`)) {
        deactivateMutation.mutate(period.id);
      }
    } else {
      if (confirm(`¿Activar el período "${period.name}"?`)) {
        activateMutation.mutate(period.id);
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

  return (
    <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#630b00]">
                  Períodos Académicos
                </h1>
                <p className="text-[#3c3c3b]/60">
                  Gestión de períodos académicos del sistema
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-[#e30513] hover:bg-[#9c0f06] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? 'Cancelar' : 'Nuevo Período'}
            </Button>
          </div>
        </div>

        {/* Formulario de creación */}
        {isCreating && (
          <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#630b00]">
                Crear Nuevo Período Académico
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
                      placeholder="Ej: 2024-1"
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
                      placeholder="Ej: Primer Semestre 2024"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate" className="text-[#3c3c3b] font-medium">
                      Fecha de inicio
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-[#3c3c3b] font-medium">
                      Fecha de fin
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                    />
                  </div>
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
                      'Crear Período'
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
                  placeholder="Buscar por código o nombre..."
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
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  <SelectItem value="active">Solo activos</SelectItem>
                  <SelectItem value="inactive">Solo inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {data && (
            <div className="mt-4 pt-4 border-t border-[#3c3c3b]/10">
              <PaginationInfo
                currentPage={data.page}
                pageSize={data.pageSize}
                totalItems={data.totalItems}
              />
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#e30513]" />
            <div>
              <p className="font-medium mb-1">Error al cargar períodos</p>
              <p className="text-sm text-[#3c3c3b]/70">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#e30513] mx-auto" />
              <p className="mt-3 text-sm text-[#3c3c3b]/60">
                Cargando períodos académicos...
              </p>
            </div>
          </div>
        )}

        {/* Lista de períodos */}
        {!loading && !error && data && (
          <>
            {data.items.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20 py-12">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-[#3c3c3b]/30" />
                  <h3 className="text-lg font-medium text-[#630b00] mb-2">
                    No se encontraron períodos
                  </h3>
                  <p className="text-sm text-[#3c3c3b]/60">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Aún no hay períodos académicos en el sistema'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {data.items.map((period) => (
                    <div key={period.id} className="relative">
                      <AcademicPeriodCard period={period} />
                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={() => handleToggleActive(period)}
                          size="sm"
                          variant="outline"
                          className={
                            period.isActive
                              ? 'border-orange-300 text-orange-700 hover:bg-orange-50 flex-1'
                              : 'border-green-300 text-green-700 hover:bg-green-50 flex-1'
                          }
                          disabled={
                            activateMutation.isPending || deactivateMutation.isPending
                          }
                        >
                          {period.isActive ? 'Desactivar' : 'Activar'}
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
