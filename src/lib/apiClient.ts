/**
 * API Client - Wrapper para fetch con manejo de autenticación y errores
 * Diseñado siguiendo principios SOLID para facilitar extensibilidad y testing
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5129';

// ============================================================================
// ERRORS - Single Responsibility: Cada error tiene su responsabilidad específica
// ============================================================================

export class UnauthorizedError extends Error {
  constructor(message = 'No autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Error de red') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message = 'Error de validación') {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// INTERFACES - Dependency Inversion: Depender de abstracciones
// ============================================================================

/**
 * Abstracción para el almacenamiento de tokens
 * Permite cambiar la implementación (localStorage, sessionStorage, cookies, etc.)
 */
interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

/**
 * Interceptor para procesar requests antes de enviarlas
 */
interface RequestInterceptor {
  onRequest(config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

/**
 * Interceptor para procesar responses antes de retornarlas
 */
interface ResponseInterceptor {
  onResponse<T>(response: Response, data: T): T | Promise<T>;
  onError?(error: Error): Error | Promise<Error>;
}

// ============================================================================
// IMPLEMENTATIONS - Implementaciones concretas de las abstracciones
// ============================================================================

/**
 * Implementación de TokenStorage usando localStorage
 * Single Responsibility: Solo maneja el almacenamiento del token
 */
class LocalStorageTokenStorage implements TokenStorage {
  private readonly key: string;

  constructor(key = 'auth_token') {
    this.key = key;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.key);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.key, token);
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.key);
  }
}

// ============================================================================
// RESPONSE HANDLER - Single Responsibility: Solo maneja responses
// ============================================================================

/**
 * Manejador de respuestas HTTP
 * Single Responsibility: Convierte Response en datos tipados o errores
 */
class ResponseHandler {
  /**
   * Procesa una respuesta HTTP y retorna los datos o lanza un error
   */
  async handle<T>(response: Response): Promise<T> {
    if (!response.ok) {
      await this.handleError(response);
    }

    return this.parseSuccessResponse<T>(response);
  }

  /**
   * Maneja respuestas de error
   */
  private async handleError(response: Response): Promise<never> {
    const status = response.status;

    // 401 → UnauthorizedError
    if (status === 401) {
      throw new UnauthorizedError('Sesión expirada o no autorizado');
    }

    // 400 → ValidationError
    if (status === 400) {
      const message = await this.extractErrorMessage(response);
      throw new ValidationError(message);
    }

    // Otros errores
    const message = await this.extractErrorMessage(response);
    throw new Error(message);
  }

  /**
   * Extrae el mensaje de error del response
   */
  private async extractErrorMessage(response: Response): Promise<string> {
    const defaultMessage = `Error ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      return errorData.message || errorData.error || defaultMessage;
    } catch {
      return defaultMessage;
    }
  }

  /**
   * Parsea una respuesta exitosa
   */
  private async parseSuccessResponse<T>(response: Response): Promise<T> {
    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Intentar parsear JSON
    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }
}

// ============================================================================
// URL BUILDER - Single Responsibility: Solo construye URLs
// ============================================================================

/**
 * Constructor de URLs
 * Single Responsibility: Construir URLs con query params
 */
class UrlBuilder {
  constructor(private baseUrl: string) {}

  build(endpoint: string, params?: Record<string, string | number | boolean>): string {
    let url = `${this.baseUrl}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      url += `?${searchParams.toString()}`;
    }

    return url;
  }
}

// ============================================================================
// HTTP CLIENT - Open/Closed: Abierto para extensión mediante interceptores
// ============================================================================

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Cliente HTTP configurable
 * Open/Closed: Extensible mediante interceptores sin modificar el código
 * Dependency Inversion: Depende de abstracciones (TokenStorage, interceptores)
 */
class HttpClient {
  private urlBuilder: UrlBuilder;
  private responseHandler: ResponseHandler;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(
    baseUrl: string,
    private tokenStorage: TokenStorage
  ) {
    this.urlBuilder = new UrlBuilder(baseUrl);
    this.responseHandler = new ResponseHandler();
  }

  /**
   * Registra un interceptor de request
   * Open/Closed: Permite extender funcionalidad sin modificar código
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Registra un interceptor de response
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Ejecuta una petición HTTP
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    try {
      // Aplicar interceptores de request
      let processedConfig = await this.applyRequestInterceptors(config);

      // Construir URL
      const { params, ...fetchOptions } = processedConfig;
      const url = this.urlBuilder.build(endpoint, params);

      // Configurar headers
      const headers = this.buildHeaders(fetchOptions.headers);

      // Ejecutar fetch
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Manejar respuesta
      let data = await this.responseHandler.handle<T>(response);

      // Aplicar interceptores de response
      data = await this.applyResponseInterceptors(response, data);

      return data;
    } catch (error) {
      // Aplicar interceptores de error
      throw await this.applyErrorInterceptors(error as Error);
    }
  }

  /**
   * Construye los headers de la petición
   */
  private buildHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    const token = this.tokenStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Aplica interceptores de request
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;

    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor.onRequest(processedConfig);
    }

    return processedConfig;
  }

  /**
   * Aplica interceptores de response
   */
  private async applyResponseInterceptors<T>(response: Response, data: T): Promise<T> {
    let processedData = data;

    for (const interceptor of this.responseInterceptors) {
      processedData = await interceptor.onResponse(response, processedData);
    }

    return processedData;
  }

  /**
   * Aplica interceptores de error
   */
  private async applyErrorInterceptors(error: Error): Promise<Error> {
    let processedError = error;

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onError) {
        processedError = await interceptor.onError(processedError);
      }
    }

    return processedError;
  }
}

// ============================================================================
// CLIENT INSTANCE - Singleton pattern con configuración inyectable
// ============================================================================

/**
 * Instancia principal del cliente HTTP
 * Dependency Inversion: Inyectamos TokenStorage en lugar de depender de localStorage directamente
 */
const defaultTokenStorage = new LocalStorageTokenStorage();
const httpClient = new HttpClient(API_BASE_URL, defaultTokenStorage);

// ============================================================================
// PUBLIC API - Interfaz pública compatible con versión anterior
// ============================================================================

/**
 * Realiza una petición GET
 */
export async function get<T>(
  url: string,
  options?: RequestConfig
): Promise<T> {
  return httpClient.request<T>(url, { ...options, method: 'GET' });
}

/**
 * Realiza una petición POST
 */
export async function post<T>(
  url: string,
  body?: unknown,
  options?: RequestConfig
): Promise<T> {
  return httpClient.request<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Realiza una petición PUT
 */
export async function put<T>(
  url: string,
  body?: unknown,
  options?: RequestConfig
): Promise<T> {
  return httpClient.request<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Realiza una petición DELETE
 */
export async function del<T>(
  url: string,
  options?: RequestConfig
): Promise<T> {
  return httpClient.request<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Cliente API - Interfaz principal para realizar peticiones HTTP
 * Mantiene compatibilidad con versión anterior
 */
export const apiClient = {
  get,
  post,
  put,
  delete: del,
  // Acceso al cliente HTTP para configuración avanzada
  _client: httpClient,
  // Acceso al token storage para operaciones de autenticación
  _tokenStorage: defaultTokenStorage,
};

// ============================================================================
// EXPORTS - Exportar tipos e interfaces para extensibilidad
// ============================================================================

export type { TokenStorage, RequestInterceptor, ResponseInterceptor, RequestConfig };
