'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMyPpas } from '@/modules/ppa';
import { PpaStatusBadge } from '@/modules/ppa';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Users, BookOpen, Calendar, Plus, GitBranch, Filter } from 'lucide-react';
import { getAcademicPeriods } from '@/modules/academic';

export default function MyPpasPage() {
  const { user } = useAuth();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>(undefined);

  const { data: ppas, isLoading, error } = useMyPpas(selectedPeriodId);
  const isAdmin = user?.roles?.includes('ADMIN');
  const isDocente = user?.roles?.includes('DOCENTE');

  // Obtener períodos académicos para el filtro
  const { data: periods = [], isLoading: isLoadingPeriods } = useQuery({
    queryKey: ['academic-periods'],
    queryFn: () => getAcademicPeriods(),
  });

  // Manejo de estados
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#e30513]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-gray-600">Por favor, inicia sesión para ver tus PPAs.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 border-red-200 bg-red-50">
            <p className="text-red-800">Error al cargar tus PPAs: {error.message}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#3c3c3b]">Mis PPAs</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus Planes de Preparación Académica
            </p>
          </div>
          {isDocente &&
            <Link href="/ppa/new">
              <Button className="bg-[#e30513] hover:bg-[#9c0f06]">
                <Plus className="mr-2 h-4 w-4" />
                Crear PPA
              </Button>
            </Link>
          }
          {isAdmin &&
            <Link href="/admin/ppa/new">
              <Button className="bg-[#e30513] hover:bg-[#9c0f06]">
                <Plus className="mr-2 h-4 w-4" />
                Crear PPA
              </Button>
            </Link>
          }
        </div>

        {/* Filtro por período */}
        <Card className="p-4 bg-white border-[#e30513]/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#630b00]">
              <Filter className="h-5 w-5" />
              <Label htmlFor="period-filter" className="font-semibold text-base">
                Filtrar por período:
              </Label>
            </div>
            <div className="flex-1 max-w-xs">
              <Select
                value={selectedPeriodId || 'all'}
                onValueChange={(value) => setSelectedPeriodId(value === 'all' ? undefined : value)}
                disabled={isLoadingPeriods}
              >
                <SelectTrigger
                  id="period-filter"
                  className="border-[#3c3c3b]/20 focus:border-[#e30513]"
                >
                  <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.code || period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPeriodId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPeriodId(undefined)}
                className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513]/5"
              >
                Limpiar filtro
              </Button>
            )}
          </div>
        </Card>

        {/* Stats */}
        {ppas && ppas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total PPAs</p>
                  <p className="text-2xl font-bold text-[#3c3c3b]">{ppas.length}</p>
                </div>
                <FileText className="h-8 w-8 text-[#e30513]" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Asignaciones</p>
                  <p className="text-2xl font-bold text-[#3c3c3b]">
                    {ppas.reduce((sum, ppa) => sum + ppa.assignmentsCount, 0)}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-[#e30513]" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-[#3c3c3b]">
                    {ppas.reduce((sum, ppa) => sum + ppa.studentsCount, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-[#e30513]" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Continuaciones</p>
                  <p className="text-2xl font-bold text-[#3c3c3b]">
                    {ppas.filter((ppa) => ppa.isContinuation).length}
                  </p>
                </div>
                <GitBranch className="h-8 w-8 text-[#e30513]" />
              </div>
            </Card>
          </div>
        )}

        {/* Lista de PPAs */}
        {!ppas || ppas.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes PPAs todavía
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primer Plan de Preparación Académica
            </p>
            {isDocente &&
              <Link href="/ppa/new">
                <Button className="bg-[#e30513] hover:bg-[#9c0f06]">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear mi primer PPA
                </Button>
              </Link>
            }
            {isAdmin &&
              <Link href="/admin/ppa/new">
                <Button className="bg-[#e30513] hover:bg-[#9c0f06]">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear mi primer PPA
                </Button>
              </Link>
            }
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {ppas.map((ppa) => (
              <Link key={ppa.id} href={`/ppa/${ppa.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-[#e30513]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#3c3c3b]">
                          {ppa.title}
                        </h3>
                        <PpaStatusBadge status={ppa.status} />
                        {ppa.isContinuation && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <GitBranch className="h-3 w-3 mr-1" />
                            Continuación
                          </span>
                        )}
                        {ppa.hasContinuation && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Tiene continuación
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{ppa.academicPeriodCode || ppa.academicPeriodId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{ppa.assignmentsCount} asignaciones</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{ppa.studentsCount} estudiantes</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      {new Date(ppa.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
