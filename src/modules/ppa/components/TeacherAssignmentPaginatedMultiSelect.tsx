'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { usePagedTeacherAssignments } from '@/modules/teacherAssignments/hooks/usePagedTeacherAssignments';
import type { TeacherAssignmentDto } from '@/modules/teacherAssignments';

interface TeacherAssignmentPaginatedMultiSelectProps {
  /** Período académico para filtrar asignaciones */
  academicPeriodId?: string;
  /** IDs seleccionados */
  value?: string[];
  /** Callback cuando cambia la selección */
  onValueChange?: (value: string[]) => void;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Placeholder cuando no hay selección */
  placeholder?: string;
}

export function TeacherAssignmentPaginatedMultiSelect({
  academicPeriodId,
  value = [],
  onValueChange,
  disabled = false,
  className,
  placeholder = 'Seleccionar asignaciones...',
}: TeacherAssignmentPaginatedMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [triggerWidth, setTriggerWidth] = React.useState<number>(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Hook de paginación con filtro por período
  const { data, loading, setSearch, setPage, setFilters } = usePagedTeacherAssignments({
    pageSize: 20,
    // Pasar vacío string cuando no hay período (el backend lo ignorará o no devolverá nada)
    academicPeriodId: academicPeriodId || '',
  });

  // Solo mostrar resultados si hay período seleccionado
  const shouldFetch = !!academicPeriodId;

  // Actualizar búsqueda con debounce
  React.useEffect(() => {
    if (!shouldFetch) return;

    const timer = setTimeout(() => {
      setSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearch, shouldFetch]);

  // Actualizar filtro de período cuando cambia
  React.useEffect(() => {
    if (academicPeriodId) {
      setFilters({ academicPeriodId });
    } else {
      // Limpiar resultados si no hay período
      setFilters({ academicPeriodId: undefined });
    }
  }, [academicPeriodId, setFilters]);

  // Medir el ancho del trigger cuando se abre el popover
  React.useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const toggleAssignment = (assignmentId: string) => {
    const newValue = value.includes(assignmentId)
      ? value.filter((id) => id !== assignmentId)
      : [...value, assignmentId];
    onValueChange?.(newValue);
  };

  const removeAssignment = (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.(value.filter((id) => id !== assignmentId));
  };

  // Obtener asignaciones seleccionadas de los datos actuales
  const selectedAssignments = React.useMemo(() => {
    if (!data || !shouldFetch) return [];
    return data.items.filter((a) => value.includes(a.id));
  }, [data, value, shouldFetch]);

  const assignments = shouldFetch ? (data?.items || []) : [];
  const hasNextPage = shouldFetch && (data?.hasNextPage || false);
  const currentPage = data?.page || 1;

  const loadMore = () => {
    if (hasNextPage && !loading) {
      setPage(currentPage + 1);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between border-[#3c3c3b]/20 focus:border-[#e30513] min-h-10 h-auto',
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedAssignments.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedAssignments.map((assignment) => (
                <Badge
                  key={assignment.id}
                  variant="secondary"
                  className="bg-[#e30513]/10 text-[#630b00] hover:bg-[#e30513]/20"
                >
                  {assignment.subjectCode}
                  <span
                    onClick={(e) => !disabled && removeAssignment(assignment.id, e)}
                    className={`ml-1 hover:text-[#e30513] ${
                      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        removeAssignment(assignment.id, e as any);
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: triggerWidth > 0 ? `${triggerWidth}px` : undefined }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por código, materia o docente..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {!shouldFetch ? (
              <CommandEmpty>
                Selecciona un período académico primero
              </CommandEmpty>
            ) : loading && assignments.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[#e30513]" />
              </div>
            ) : assignments.length === 0 ? (
              <CommandEmpty>
                No se encontraron asignaciones
              </CommandEmpty>
            ) : (
              <>
                <CommandGroup>
                  {assignments.map((assignment) => {
                    const isSelected = value.includes(assignment.id);

                    return (
                      <CommandItem
                        key={assignment.id}
                        value={assignment.id}
                        onSelect={() => toggleAssignment(assignment.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className={cn(
                              'flex h-4 w-4 items-center justify-center rounded-sm border border-[#e30513]',
                              isSelected
                                ? 'bg-[#e30513] text-white'
                                : 'opacity-50 [&_svg]:invisible'
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-[#630b00]">
                              {assignment.subjectCode} - {assignment.subjectName}
                            </div>
                            {assignment.teacherName && (
                              <div className="text-xs text-[#3c3c3b]/60">
                                {assignment.teacherName}
                              </div>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                {/* Botón para cargar más */}
                {hasNextPage && (
                  <div className="border-t border-[#3c3c3b]/10 p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full text-[#e30513] hover:bg-[#e30513]/5"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          Cargar más resultados
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
        {value.length > 0 && (
          <div className="border-t border-[#3c3c3b]/10 p-2 text-xs text-[#3c3c3b]/60">
            {value.length} asignación{value.length !== 1 ? 'es' : ''} seleccionada
            {value.length !== 1 ? 's' : ''}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
