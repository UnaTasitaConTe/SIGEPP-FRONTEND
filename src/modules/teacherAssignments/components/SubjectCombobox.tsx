'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubjects } from '@/modules/academic';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Loader2 } from 'lucide-react';

interface SubjectComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SubjectCombobox({
  value,
  onValueChange,
  disabled = false,
  className,
}: SubjectComboboxProps) {
  // Cargar asignaturas
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getSubjects(),
  });

  // Mapear a opciones con búsqueda por código y nombre
  const subjectOptions: ComboboxOption[] = useMemo(() => {
    return subjects.map((subject) => ({
      value: subject.id,
      label: `${subject.code} - ${subject.name}`,
      searchText: `${subject.code} ${subject.name}`.toLowerCase(), // Búsqueda por código o nombre
    }));
  }, [subjects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 border border-[#3c3c3b]/20 rounded-md bg-muted">
        <Loader2 className="h-4 w-4 animate-spin text-[#e30513]" />
      </div>
    );
  }

  return (
    <Combobox
      options={subjectOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Buscar asignatura..."
      emptyText="No se encontraron asignaturas"
      searchPlaceholder="Buscar por código o nombre..."
      disabled={disabled}
      className={className}
    />
  );
}
