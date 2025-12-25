'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { TeacherAssignmentDto } from '@/modules/teacherAssignments';

interface TeacherAssignmentMultiSelectProps {
  /** Asignaciones docentes disponibles */
  assignments: Array<TeacherAssignmentDto>;
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

export function TeacherAssignmentMultiSelect({
  assignments,
  value = [],
  onValueChange,
  disabled = false,
  className,
  placeholder = 'Seleccionar asignaciones...',
}: TeacherAssignmentMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [triggerWidth, setTriggerWidth] = React.useState<number>(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

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

  const selectedAssignments = assignments.filter((a) => value.includes(a.id));

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
                    className={`ml-1 hover:text-[#e30513] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
        <Command>
          <CommandInput placeholder="Buscar por código, materia o docente..." />
          <CommandList>
            <CommandEmpty>No se encontraron asignaciones</CommandEmpty>
            <CommandGroup>
              {assignments.map((assignment) => {
                const isSelected = value.includes(assignment.id);
                const searchText = `${assignment.subjectCode} ${assignment.subjectName} ${assignment.teacherName || ''}`.toLowerCase();

                return (
                  <CommandItem
                    key={assignment.id}
                    value={searchText}
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
          </CommandList>
        </Command>
        {value.length > 0 && (
          <div className="border-t border-[#3c3c3b]/10 p-2 text-xs text-[#3c3c3b]/60">
            {value.length} asignación{value.length !== 1 ? 'es' : ''} seleccionada{value.length !== 1 ? 's' : ''}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
