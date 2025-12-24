'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAcademicPeriods } from '@/modules/academic';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Loader2 } from 'lucide-react';

interface PeriodComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PeriodCombobox({
  value,
  onValueChange,
  disabled = false,
  className,
}: PeriodComboboxProps) {
  // Cargar períodos académicos
  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['academic-periods'],
    queryFn: () => getAcademicPeriods(),
  });

  // Mapear a opciones con indicador de activo
  const periodOptions: ComboboxOption[] = useMemo(() => {
    return periods.map((period) => ({
      value: period.id,
      label: period.isActive ? `${period.name} (Activo)` : period.name,
      searchText: period.name.toLowerCase(),
    }));
  }, [periods]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 border border-[#3c3c3b]/20 rounded-md bg-muted">
        <Loader2 className="h-4 w-4 animate-spin text-[#e30513]" />
      </div>
    );
  }

  return (
    <Combobox
      options={periodOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Buscar período..."
      emptyText="No se encontraron períodos"
      searchPlaceholder="Buscar por nombre..."
      disabled={disabled}
      className={className}
    />
  );
}
