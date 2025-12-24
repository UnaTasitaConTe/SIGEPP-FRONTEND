/**
 * Servicio base genérico para paginación
 * Todos los servicios paginados extienden de esta clase base
 * Reutiliza el apiClient existente del proyecto
 */

import { apiClient } from '@/lib/apiClient';
import type { PagedResult, BasePagedParams } from '@/types/common';

/**
 * Clase base abstracta para servicios paginados
 * Proporciona funcionalidad común de paginación para todos los módulos
 *
 * @template T - El tipo de DTO que se retorna (UserDto, PpaDto, etc.)
 * @template TParams - Los parámetros de filtrado específicos del módulo
 */
export abstract class BasePagedService<T, TParams extends BasePagedParams> {
  /**
   * Constructor protegido que recibe la URL base del endpoint
   * @param baseUrl - URL base del endpoint (ej: "/api/Users")
   */
  protected constructor(protected readonly baseUrl: string) {}

  /**
   * Obtiene datos paginados del backend
   * @param params - Parámetros de paginación y filtros
   * @returns Promesa con el resultado paginado
   */
  async getPaged(params: TParams): Promise<PagedResult<T>> {
    const queryParams = this.buildQueryParams(params);

    // Usa el apiClient que ya existe en el proyecto
    return apiClient.get<PagedResult<T>>(
      `${this.baseUrl}/paged?${queryParams.toString()}`
    );
  }

  /**
   * Construye los query parameters para la petición
   * Filtra valores undefined, null y strings vacíos
   * @param params - Parámetros de paginación y filtros
   * @returns URLSearchParams listos para usar
   */
  protected buildQueryParams(params: TParams): URLSearchParams {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    return queryParams;
  }
}
