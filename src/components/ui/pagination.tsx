/**
 * Componente de Paginación reutilizable para SIGEPP
 * Sigue la paleta de colores corporativa y diseño moderno
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Componente de Paginación
 * Muestra controles de navegación entre páginas
 *
 * @example
 * <Pagination
 *   currentPage={2}
 *   totalPages={10}
 *   hasPrevious={true}
 *   hasNext={true}
 *   onPageChange={(page) => console.log(page)}
 * />
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
}) => {
  // Si no hay páginas, no mostrar el componente
  if (totalPages <= 0) {
    return null;
  }

  // Generar array de números de página a mostrar
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Máximo de números de página visibles

    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);

      if (currentPage <= 3) {
        // Si estamos cerca del inicio
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Si estamos cerca del final
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Si estamos en el medio
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200
          ${
            hasPrevious
              ? 'bg-white text-[#3c3c3b] border border-[#e30513]/20 hover:bg-[#f2f2f2] hover:border-[#e30513]/40'
              : 'bg-[#f2f2f2] text-gray-400 border border-gray-200 cursor-not-allowed'
          }
        `}
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Anterior</span>
      </button>

      {/* Números de página */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-[#3c3c3b] text-sm"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium min-w-[40px]
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-[#e30513] text-white border border-[#e30513]'
                    : 'bg-white text-[#3c3c3b] border border-[#e30513]/20 hover:bg-[#f2f2f2] hover:border-[#e30513]/40'
                }
              `}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200
          ${
            hasNext
              ? 'bg-white text-[#3c3c3b] border border-[#e30513]/20 hover:bg-[#f2f2f2] hover:border-[#e30513]/40'
              : 'bg-[#f2f2f2] text-gray-400 border border-gray-200 cursor-not-allowed'
          }
        `}
      >
        <span>Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Componente de información de paginación
 * Muestra "Mostrando X-Y de Z resultados"
 */
export interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  pageSize,
  totalItems,
}) => {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) {
    return (
      <p className="text-sm text-[#3c3c3b]/70">No hay resultados</p>
    );
  }

  return (
    <p className="text-sm text-[#3c3c3b]/70">
      Mostrando <span className="font-medium text-[#630b00]">{from}</span> a{' '}
      <span className="font-medium text-[#630b00]">{to}</span> de{' '}
      <span className="font-medium text-[#630b00]">{totalItems}</span> resultados
    </p>
  );
};
