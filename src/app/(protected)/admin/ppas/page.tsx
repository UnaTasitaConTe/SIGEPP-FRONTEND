/**
 * Página de administración de PPAs
 * Ruta: /admin/ppas
 *
 * Permite a los administradores ver todos los PPAs de un período académico
 */

'use client';

import { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  User,
  Filter,
  Loader2,
  AlertCircle,
  Eye,
  Search,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAcademicPeriods, useActivePeriod } from '@/modules/academic';
import { usePpasByPeriod, PpaStatusLabels, type PpaStatus } from '@/modules/ppa';
import { PpaStatusBadge } from '@/modules/ppa/components/PpaStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminPpasPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PpaStatus | 'all'>('all');

  // Obtener períodos académicos
  const { data: periods = [], isLoading: isLoadingPeriods } =
    useAcademicPeriods();

  // Obtener período activo
  const { data: activePeriod, isLoading: isLoadingActivePeriod } =
    useActivePeriod();

  // Establecer período activo como seleccionado por defecto
  if (activePeriod && !selectedPeriodId && !isLoadingActivePeriod) {
    setSelectedPeriodId(activePeriod.id);
  }

  // Obtener PPAs del período seleccionado
  const {
    data: ppas = [],
    isLoading: isLoadingPpas,
    error: ppasError,
  } = usePpasByPeriod(selectedPeriodId);

  // Verificar permisos
  const isAdmin = user?.roles?.includes('ADMIN');
  const isConsultor = user?.roles?.includes('CONSULTA_INTERNA');

  // Filtrar PPAs según búsqueda y estado
  const filteredPpas = useMemo(() => {
    let filtered = ppas;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ppa) =>
          ppa.title.toLowerCase().includes(search) ||
          ppa.description?.toLowerCase().includes(search) ||
          ppa.primaryTeacherId.toLowerCase().includes(search)
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ppa) => ppa.status === statusFilter);
    }

    return filtered;
  }, [ppas, searchTerm, statusFilter]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = ppas.length;
    const byStatus = {
      Proposal: ppas.filter((p) => p.status === 'Proposal').length,
      InProgress: ppas.filter((p) => p.status === 'InProgress').length,
      Completed: ppas.filter((p) => p.status === 'Completed').length,
      Archived: ppas.filter((p) => p.status === 'Archived').length,
    };

    return { total, byStatus };
  }, [ppas]);

  // Loading state
  if (isAuthLoading || isLoadingPeriods || isLoadingActivePeriod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e30513] mx-auto" />
          <p className="mt-4 text-[#3c3c3b]">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar permisos de administrador
  if (!isAdmin && !isConsultor) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Acceso Denegado</h3>
              <p className="text-sm text-[#3c3c3b]/70">
                No tienes permisos para acceder a esta página. Solo
                administradores pueden ver todos los PPAs.
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#630b00]">
                Administración de PPAs
              </h1>
            </div>
          </div>
        </div>

        {/* Selector de período académico */}
        <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#630b00] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#e30513]" />
              Período Académico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
              <SelectTrigger className="max-w-md border-[#3c3c3b]/20 focus:border-[#e30513]">
                <SelectValue placeholder="Selecciona un período académico" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.code} - {period.name}
                    {period.isActive && (
                      <span className="ml-2 text-xs text-[#e30513]">(Activo)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        {selectedPeriodId && !isLoadingPpas && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3c3c3b]/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-[#3c3c3b]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#630b00]">
                      {stats.total}
                    </p>
                    <p className="text-xs text-[#3c3c3b]/60">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">
                      {stats.byStatus.Proposal}
                    </p>
                    <p className="text-xs text-blue-600/60">
                      {PpaStatusLabels.Proposal}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-700">
                      {stats.byStatus.InProgress}
                    </p>
                    <p className="text-xs text-yellow-600/60">
                      {PpaStatusLabels.InProgress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">
                      {stats.byStatus.Completed}
                    </p>
                    <p className="text-xs text-green-600/60">
                      {PpaStatusLabels.Completed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-700">
                      {stats.byStatus.Archived}
                    </p>
                    <p className="text-xs text-gray-600/60">
                      {PpaStatusLabels.Archived}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros y búsqueda */}
        {selectedPeriodId && !isLoadingPpas && ppas.length > 0 && (
          <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#630b00] flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#e30513]" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#3c3c3b]/40" />
                    <Input
                      type="text"
                      placeholder="Buscar por título, descripción o docente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#3c3c3b]/20 focus:border-[#e30513]"
                    />
                  </div>
                </div>

                {/* Filtro por estado */}
                <div className="w-full md:w-64">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as PpaStatus | 'all')
                    }
                  >
                    <SelectTrigger className="border-[#3c3c3b]/20 focus:border-[#e30513]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
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
                </div>
              </div>

              {/* Resultados de búsqueda */}
              {searchTerm || statusFilter !== 'all' ? (
                <p className="text-sm text-[#3c3c3b]/60 mt-3">
                  Mostrando {filteredPpas.length} de {ppas.length} PPAs
                </p>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Lista de PPAs */}
        {selectedPeriodId && (
          <>
            {isLoadingPpas ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#e30513]" />
              </div>
            ) : ppasError ? (
              <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Error al cargar PPAs
                  </h3>
                  <p className="text-sm text-[#3c3c3b]/70">
                    No se pudieron cargar los PPAs del período seleccionado.
                    Intenta de nuevo más tarde.
                  </p>
                </div>
              </div>
            ) : filteredPpas.length === 0 ? (
              <Card className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20">
                <CardContent className="py-12">
                  <div className="text-center text-[#3c3c3b]/60">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      {searchTerm || statusFilter !== 'all'
                        ? 'No se encontraron PPAs con los filtros aplicados'
                        : 'No hay PPAs registrados para este período académico'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPpas.map((ppa) => (
                  <Card
                    key={ppa.id}
                    className="bg-white rounded-xl shadow-sm border border-[#e30513]/20 hover:border-[#e30513]/40 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-[#630b00] mb-1">
                                {ppa.title}
                              </h3>
                              {ppa.description && (
                                <p className="text-sm text-[#3c3c3b]/70 line-clamp-2">
                                  {ppa.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-[#3c3c3b]/70">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#e30513]" />
                              <span>Docente: {ppa.teacherPrimaryName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#e30513]" />
                              <span>
                                Creado:{' '}
                                {new Date(ppa.createdAt).toLocaleDateString(
                                  'es-ES'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <PpaStatusBadge status={ppa.status} />
                          <Link href={`/ppa/${ppa.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalle
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Mensaje cuando no hay período seleccionado */}
        {!selectedPeriodId && (
          <Card className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20">
            <CardContent className="py-12">
              <div className="text-center text-[#3c3c3b]/60">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  Selecciona un período académico para ver los PPAs
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
