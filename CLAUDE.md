# SIGEPP

---

## 1. Frontend

**Stack:**

- Next.js 14+ (App Router, carpeta `app/`)
- TypeScript
- TailwindCSS
- shadcn/ui
- lucide-react
- React Query (para datos del backend)
- Contextos ligeros (por ejemplo, Auth)
- Cliente HTTP propio: `apiClient` basado en `fetch`

**Estructura por features (preferida):**

- `src/lib/apiClient.ts`
- `src/modules/auth/*`
- `src/modules/ppa/*`
- `src/modules/academic/*`
- `src/modules/users/*`
- `src/app/login/page.tsx`
- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/dashboard/page.tsx`

Reglas de estilo:

- Código limpio y modular.
- Lógica de UI en componentes, lógica de orquestación en hooks/servicios.
- Usar `async/await`, no encadenar `.then()` innecesario.

---

## 2. API Client

- `apiClient` debe:
  - Usar `process.env.NEXT_PUBLIC_API_BASE_URL`.
  - Adjuntar `Authorization: Bearer <token>` si hay token.
  - Interpretar respuestas JSON del backend, incluyendo `{ message: "..." }` en errores.
  - Lanzar errores claros (por ejemplo, distinguir 401).

---

## 3. Autenticación en el frontend

**Endpoints backend:**

- `POST /api/Auth/login` → token + datos básicos.
- `GET /api/Auth/me` → `userId`, `email`, `name`, `roles`, `permissions`.

**AuthProvider + useAuth:**

- Debe exponer:
  - `user: CurrentUser | null`
  - `token: string | null`
  - `isLoading: boolean`
  - `login(email, password)`
  - `logout()`
- El token se guarda en `localStorage` y en memoria.
- Todas las peticiones al backend deben pasar por `apiClient`.

---

## 4. Regla estricta: manejo de `user` en vistas protegidas

Nunca asumir que `user` está definido en el primer render.

Siempre manejar tres estados:

1. `isLoading === true` → mostrar pantalla de carga.
2. `!user` → redirigir a `/login` o mostrar un estado seguro.
3. Solo cuando `user` exista → usar sus datos.

Acceso a propiedades:

- ❌ No hacer: `user.permissions.length`
- ✅ Hacer: `const permissionsCount = user?.permissions?.length ?? 0;`

Layouts protegidos:

- Si `isLoading` → pantalla de “Validando sesión…”.
- Si `!user` → `router.replace("/login")` y `return null`.
- Solo luego renderizar `{children}`.

---

## 5. Roles

Roles del backend que el frontend debe respetar:

- `ADMIN`
- `DOCENTE`
- `CONSULTA_INTERNA`

Usos típicos:

- Mostrar/ocultar secciones según rol.
- No implementar todavía autorización súper granular; para el MVP basta con:
  - Sesión activa.
  - Rol básico para decidir qué menú mostrar.

---

## 6. Paleta de colores corporativa SIGEPP

**Colores:**

- Rojo principal: `#e30513`
- Rojo oscuro: `#9c0f06`
- Vino/marrón: `#630b00`
- Gris oscuro: `#3c3c3b`
- Fondo base: `#f2f2f2`

**Uso recomendado:**

- Fondo general app / layouts protegidos:  
  `className="bg-[#f2f2f2]"`
- Botones primarios:  
  `className="bg-[#e30513] hover:bg-[#9c0f06] text-white"`
- Títulos / textos destacados:  
  `className="text-[#630b00]"` o `className="text-[#3c3c3b]"`
- Cards/containers:  
  `className="bg-white rounded-xl shadow-sm border border-[#e30513]/20"`

---

## 7. Consistencia general

- Mantener nombres alineados con el backend (`Ppa`, `PpaAttachment`, `AcademicPeriod`, `Subject`, etc.).
- Antes de crear algo nuevo, revisar si ya existe algo similar.
- No cambiar arquitectura ni contratos de API sin dejarlo documentado en comentarios.

## CONTRATO DE API (FUENTE DE VERDAD)

- Existe un archivo `API_DOCUMENTACIÓN.json` con la especificación OpenAPI completa del backend SIGEPP.
- PARA CUALQUIER COSA DE FRONTEND (tipos, endpoints, payloads, rutas, nombres de campos):
  - **NO inventes nada.**
  - **NO asumas nombres de campos o URLs.**
  - Debes leer y usar SIEMPRE la especificación de `API_DOCUMENTACIÓN.json` como fuente oficial.
- Los módulos del frontend deben alinearse con los tags de la API:

  - `Auth` → login, `/api/Auth/login`, `/api/Auth/me`
  - `Users` → gestión de usuarios: listar, detalle, crear, editar, activar/desactivar, roles, permisos.
  - `AcademicPeriods` → CRUD + activar/desactivar períodos académicos.
  - `Subjects` → CRUD + activar/desactivar asignaturas.
  - `TeacherAssignments` → asignar docentes a materias y períodos, activar/desactivar, eliminar.
  - `Ppa` → CRUD de PPA + cambio de estado + consultas por período/docente.
  - `PpaAttachments` → listado, alta y baja lógica de anexos de PPA.
  - `FileStorage` → subida física de archivos (MinIO) y obtención de `fileKey`.

### REGLA ESTRICTA PARA FRONTEND

Cuando trabajes en el frontend:

1. Antes de escribir código de red (`fetch`, React Query, etc.):
   - Localiza el endpoint en `API_DOCUMENTACIÓN.json`.
   - Respeta método HTTP, ruta, parámetros, schema del body y schema de respuesta.

2. Genera tipos TypeScript basados en los schemas de OpenAPI:
   - Ejemplos: `LoginResult`, `UserDto`, `AcademicPeriodDto`, `PpaDto`, `PpaDetailDto`, `PpaAttachmentDto`, etc.
   - Los nombres de tipos deben coincidir 1:1 con los schemas de OpenAPI cuando tenga sentido.

3. Cualquier formulario (crear/editar):
   - Debe respetar los campos y restricciones del comando correspondiente:
     - `CreateUserCommand`, `UpdateUserCommand`
     - `CreateAcademicPeriodCommand`, `UpdateAcademicPeriodCommand`
     - `CreateSubjectCommand`, `UpdateSubjectCommand`
     - `CreatePpaCommand`, `UpdatePpaCommand`
     - `AddPpaAttachmentRequest`
   - Usa validaciones en el frontend (zod o similar) alineadas con `maxLength`, `minLength`, `required` de la API.

4. Rutas recomendadas en el frontend (App Router):
   - `/login` → Auth
   - `/(protected)/dashboard` → tablero general.
   - `/(protected)/users` → listado + acciones.
   - `/(protected)/users/[id]` → detalle/edición.
   - `/(protected)/academic/periods` → períodos académicos.
   - `/(protected)/academic/subjects` → asignaturas.
   - `/(protected)/academic/teacher-assignments` → asignaciones docente–materia–período.
   - `/(protected)/ppa` → listado de PPAs.
   - `/(protected)/ppa/[id]` → detalle/edición de PPA.
   - `/(protected)/ppa/[id]/attachments` → gestión de anexos (subir usando `FileStorage` y luego registrar en `PpaAttachments`).

5. Autorización en UI:
   - Usa siempre el `user` del contexto de Auth (datos de `/api/Auth/me` o `LoginResult`) para decidir qué mostrar.
   - Respeta estos roles:
     - `ADMIN`: acceso completo a Users y configuración académica.
     - `DOCENTE`: acceso a sus PPAs, anexos y asignaciones propias.
     - `CONSULTA_INTERNA`: solo lectura en la mayoría de pantallas.
   - **Nunca** llames endpoints que el backend no expone o para roles que no tengan sentido según la API.

6. Diseño:
   - Usa SIEMPRE la paleta corporativa ya definida en este archivo.
   - Layouts modernos, limpios y responsivos (cards, grids, tablas con `shadcn/ui`).
   - Nada de estilos inline gigantes; usa utilidades de Tailwind.

Si el código existente del frontend NO respeta lo anterior, debes:
- Refactorizarlo para alinearlo con `API_DOCUMENTACIÓN.json` y este `CLAUDE.md`.
- Explicar en comentarios breves qué cambiaste y por qué (ej: "align with CreatePpaCommand schema").
