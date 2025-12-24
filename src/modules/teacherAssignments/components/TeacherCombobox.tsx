'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/modules/users';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Loader2 } from 'lucide-react';

interface TeacherComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TeacherCombobox({
  value,
  onValueChange,
  disabled = false,
  className,
}: TeacherComboboxProps) {
  // Cargar usuarios
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  // Filtrar solo docentes y mapear a opciones
  const teacherOptions: ComboboxOption[] = useMemo(() => {
    const teachers = users.filter((u) => u.roles?.includes('DOCENTE'));
    return teachers.map((teacher) => ({
      value: teacher.id,
      label: teacher.name,
      searchText: teacher.name.toLowerCase(), // Para búsqueda case-insensitive
    }));
  }, [users]);

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
