'use client';

import { useMemo } from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Loader2 } from 'lucide-react';

interface AcademicPeriodComboboxProps {
  /** Períodos académicos disponibles */
  periods: Array<{ id: string; name: string; code?: string | null }>;
  /** Valor seleccionado (ID del período) */
  value?: string;
  /** Callback cuando cambia la selección */
  onValueChange?: (value: string) => void;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Si está cargando */
  isLoading?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function AcademicPeriodCombobox({
  periods,
  value,
  onValueChange,
  disabled = false,
  isLoading = false,
  className,
}: AcademicPeriodComboboxProps) {
  // Mapear a opciones con búsqueda por código y nombre
  const periodOptions: ComboboxOption[] = useMemo(() => {
    return periods.map((period) => ({
      value: period.id,
      label: period.name,
      // Búsqueda por código y nombre
      searchText: `${period.code || ''} ${period.name}`.toLowerCase(),
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
      placeholder="Buscar período académico..."
      emptyText="No se encontraron períodos"
      searchPlaceholder="Buscar por código o nombre..."
      disabled={disabled}
      className={className}
    />
  );
}
