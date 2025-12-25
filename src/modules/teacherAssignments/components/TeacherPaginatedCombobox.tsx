'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, ChevronDown } from 'lucide-react';
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
import { usePagedUsers } from '@/modules/users/hooks/usePagedUsers';

interface TeacherPaginatedComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TeacherPaginatedCombobox({
  value,
  onValueChange,
  disabled = false,
  className,
}: TeacherPaginatedComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Hook de paginación - solo docentes
  const { data, loading, setSearch, setPage, setFilters } = usePagedUsers({
    pageSize: 20,
  });

  // Filtrar solo docentes en el primer render
  React.useEffect(() => {
    setFilters({ roleCode: 'DOCENTE' });
  }, [setFilters]);

  // Actualizar búsqueda con debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearch]);

  const users = data?.items || [];
  const hasNextPage = data?.hasNextPage || false;
  const currentPage = data?.page || 1;

  const loadMore = () => {
    if (hasNextPage && !loading) {
      setPage(currentPage + 1);
    }
  };

  // Encontrar el usuario seleccionado
  const selectedUser = users.find((u) => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between border-[#3c3c3b]/20 focus:border-[#e30513]',
            className
          )}
        >
          {value && selectedUser ? (
            <span>{selectedUser.name}</span>
          ) : (
            <span className="text-muted-foreground">Buscar docente...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[#e30513]" />
              </div>
            ) : users.length === 0 ? (
              <CommandEmpty>No se encontraron docentes</CommandEmpty>
            ) : (
              <>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => {
                        onValueChange?.(user.id);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === user.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-[#630b00]">
                          {user.name}
                        </div>
                        <div className="text-xs text-[#3c3c3b]/60">
                          {user.email}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
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
      </PopoverContent>
    </Popover>
  );
}
