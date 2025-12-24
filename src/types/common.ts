/**
 * Tipos compartidos de paginación para SIGEPP
 * Estos tipos se usan en todos los módulos que requieren paginación
 * Alineados con la especificación del backend (PagedResult<T>)
 */

// ============================================================================
// PAGED RESULT - Respuesta paginada del backend
// ============================================================================

/**
 * Respuesta paginada genérica del backend
 * Envuelve cualquier tipo de DTO en una estructura de paginación
 */
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================================================
// BASE PAGED PARAMS - Parámetros base de paginación
// ============================================================================

/**
 * Parámetros base para consultas paginadas
 * Todos los módulos extienden estos parámetros base
 */
export interface BasePagedParams {
  page?: number;       // Número de página (default: 1)
  pageSize?: number;   // Tamaño de página (default: 10)
  search?: string;     // Búsqueda general
  isActive?: boolean;  // Filtro por estado activo/inactivo
}
