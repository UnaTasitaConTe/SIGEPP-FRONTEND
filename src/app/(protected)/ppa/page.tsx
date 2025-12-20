/**
 * Página "Mis PPA" - Lista de PPAs del docente
 * Ruta: /ppa
 *
 * Permite al docente ver todos sus PPAs por período académico
 */

'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Loader2, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAcademicPeriods, useActivePeriod } from '@/modules/academic';
import { usePpasByTeacher } from '@/modules/ppa';
import { PpaCard } from '@/modules/ppa/components/PpaCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function MisPpaPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  // Obtener períodos académicos usando el hook
  const {
    data: periods = [],
    isLoading: isLoadingPeriods,
    error: periodsError,
  } = useAcademicPeriods();

  // Obtener período activo usando el hook
  const { data: activePeriod } = useActivePeriod();

  // Establecer período activo por defecto
  useEffect(() => {
    if (activePeriod && !selectedPeriodId) {
      setSelectedPeriodId(activePeriod.id);
    } else if (!activePeriod && periods.length > 0 && !selectedPeriodId) {
      // Si no hay período activo, usar el primero de la lista
      setSelectedPeriodId(periods[0].id);
    }
  }, [activePeriod, periods, selectedPeriodId]);

  // Obtener PPAs del docente para el período seleccionado usando el hook
  const {
    data: ppas = [],
    isLoading: isLoadingPpas,
    error: ppasError,
  } = usePpasByTeacher(user?.userId || '', selectedPeriodId);

  // Mientras carga la autenticación
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

  // Si no hay usuario (el layout protegido ya debería redirigir)
  if (!user) {
    return null;
  }

  const isLoading = isLoadingPeriods || isLoadingPpas;
  const hasError = periodsError || ppasError;
  const canCreate =
    user?.roles?.includes('ADMIN') || user?.roles?.includes('DOCENTE');

  return (
    <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#630b00]">Mis PPA</h1>
              </div>
            </div>

            {canCreate && (
              <Link href="/ppa/new">
                <Button className="bg-[#e30513] hover:bg-[#9c0f06] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Nuevo PPA
                </Button>
              </Link>
            )}
          </div>

          {/* Información del docente */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-[#e30513]/20">
            <p className="text-sm text-[#3c3c3b]/70">
              <span className="font-medium text-[#630b00]">Docente:</span>{' '}
              {user.name || user.email}
            </p>
          </div>
        </div>

        {/* Selector de período */}
        <div className="mb-6 bg-white rounded-xl p-6 shadow-sm border border-[#e30513]/20">
          <div className="max-w-md">
            <Label
              htmlFor="period-select"
              className="text-[#3c3c3b] font-medium mb-2 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-[#e30513]" />
              Período Académico
            </Label>
            <Select
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
              disabled={isLoadingPeriods || periods.length === 0}
            >
              <SelectTrigger
                id="period-select"
                className="mt-2 border-[#3c3c3b]/20 focus:border-[#e30513]"
              >
                <SelectValue placeholder="Selecciona un período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                    {period.isActive && (
                      <span className="ml-2 text-xs text-[#e30513]">(Activo)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error state */}
        {hasError && (
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#e30513]" />
            <div>
              <p className="font-medium mb-1">Error al cargar datos</p>
              <p className="text-sm text-[#3c3c3b]/70">
                {periodsError
                  ? 'No se pudieron cargar los períodos académicos'
                  : 'No se pudieron cargar los PPAs'}
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
                Cargando PPAs...
              </p>
            </div>
          </div>
        )}

        {/* Lista de PPAs */}
        {!isLoading && !hasError && (
          <>
            {ppas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20 py-12">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#3c3c3b]/30" />
                  <h3 className="text-lg font-medium text-[#630b00] mb-2">
                    No hay PPAs para este período
                  </h3>
                  <p className="text-sm text-[#3c3c3b]/60">
                    {selectedPeriodId
                      ? 'No tienes PPAs asignados para el período seleccionado'
                      : 'Selecciona un período académico para ver tus PPAs'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-[#3c3c3b]/70">
                    Mostrando{' '}
                    <span className="font-semibold text-[#630b00]">
                      {ppas.length}
                    </span>{' '}
                    {ppas.length === 1 ? 'PPA' : 'PPAs'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ppas.map((ppa) => (
                    <PpaCard key={ppa.id} ppa={ppa} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
