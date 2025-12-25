'use client';

import { useMemo } from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Loader2 } from 'lucide-react';

interface TeacherComboboxProps {
  /** Docentes disponibles */
  teachers: Array<{ id: string; name: string }>;
  /** Valor seleccionado (ID del docente) */
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

export function TeacherCombobox({
  teachers,
  value,
  onValueChange,
  disabled = false,
  isLoading = false,
  className,
}: TeacherComboboxProps) {
  // Mapear a opciones con búsqueda por nombre
  const teacherOptions: ComboboxOption[] = useMemo(() => {
    return teachers.map((teacher) => ({
      value: teacher.id,
      label: teacher.name,
      searchText: teacher.name.toLowerCase(), // Búsqueda case-insensitive
    }));
  }, [teachers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 border border-[#3c3c3b]/20 rounded-md bg-muted">
        <Loader2 className="h-4 w-4 animate-spin text-[#e30513]" />
      </div>
    );
  }

  return (
    <Combobox
      options={teacherOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Buscar docente..."
      emptyText="No se encontraron docentes"
      searchPlaceholder="Buscar por nombre..."
      disabled={disabled}
      className={className}
    />
  );
}
