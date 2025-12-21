# ESPECIFICACIÓN COMPLETA - MÓDULO PPAs

**Fuente de verdad:** `DocumentacionApi/openapi.Ppa.json` + `DocumentacionApi/openapi.PpaAttachments.json`
**Fecha:** 2025-12-20
**Estado:** Verificado con backend

---

## TABLA DE CONTENIDOS

1. [Enums y Tipos](#1-enums-y-tipos)
2. [Endpoints - Ppa](#2-endpoints---ppa)
3. [Endpoints - PpaAttachments](#3-endpoints---ppaattachments)
4. [DTOs Request](#4-dtos-request)
5. [DTOs Response](#5-dtos-response)
6. [Máquina de Estados](#6-máquina-de-estados)
7. [Permisos y Autorización](#7-permisos-y-autorización)
8. [Validaciones y Límites](#8-validaciones-y-límites)
9. [Casos Borde](#9-casos-borde)
10. [Implementación Frontend](#10-implementación-frontend)

---

## 1. ENUMS Y TIPOS

### 1.1 PpaStatus

```typescript
enum PpaStatus {
  Proposal = 0,      // Propuesta inicial
  InProgress = 1,    // En desarrollo activo
  Completed = 2,     // Finalizado
  Archived = 3       // Archivado (estado terminal)
}
```

**Labels en español:**
```typescript
const PpaStatusLabels: Record<PpaStatus, string> = {
  [PpaStatus.Proposal]: 'Propuesta',
  [PpaStatus.InProgress]: 'En Progreso',
  [PpaStatus.Completed]: 'Completado',
  [PpaStatus.Archived]: 'Archivado'
};
```

**Colores recomendados (paleta SIGEPP):**
```typescript
const PpaStatusColors: Record<PpaStatus, string> = {
  [PpaStatus.Proposal]: '#9c0f06',      // Rojo oscuro
  [PpaStatus.InProgress]: '#e30513',     // Rojo principal
  [PpaStatus.Completed]: '#3c3c3b',      // Gris oscuro
  [PpaStatus.Archived]: '#630b00'        // Vino/marrón
};
```

---

### 1.2 PpaHistoryActionType

```typescript
enum PpaHistoryActionType {
  Created = 0,
  UpdatedTitle = 1,
  ChangedStatus = 2,
  ChangedResponsibleTeacher = 3,
  UpdatedAssignments = 4,
  UpdatedStudents = 5,
  UpdatedContinuationSettings = 6,
  AttachmentAdded = 7,
  AttachmentRemoved = 8,
  ContinuationCreated = 9,
  UpdatedGeneralObjective = 10,
  UpdatedSpecificObjectives = 11,
  UpdatedDescription = 12
}
```

**Labels en español:**
```typescript
const PpaHistoryActionLabels: Record<PpaHistoryActionType, string> = {
  [PpaHistoryActionType.Created]: 'Creación',
  [PpaHistoryActionType.UpdatedTitle]: 'Actualización de título',
  [PpaHistoryActionType.ChangedStatus]: 'Cambio de estado',
  [PpaHistoryActionType.ChangedResponsibleTeacher]: 'Cambio de responsable',
  [PpaHistoryActionType.UpdatedAssignments]: 'Actualización de asignaciones',
  [PpaHistoryActionType.UpdatedStudents]: 'Actualización de estudiantes',
  [PpaHistoryActionType.UpdatedContinuationSettings]: 'Actualización de configuración de continuación',
  [PpaHistoryActionType.AttachmentAdded]: 'Anexo agregado',
  [PpaHistoryActionType.AttachmentRemoved]: 'Anexo eliminado',
  [PpaHistoryActionType.ContinuationCreated]: 'Continuación creada',
  [PpaHistoryActionType.UpdatedGeneralObjective]: 'Actualización de objetivo general',
  [PpaHistoryActionType.UpdatedSpecificObjectives]: 'Actualización de objetivos específicos',
  [PpaHistoryActionType.UpdatedDescription]: 'Actualización de descripción'
};
```

---

### 1.3 PpaAttachmentType

```typescript
enum PpaAttachmentType {
  PpaDocument = 0,           // Documento formal del PPA (requerido para Completed)
  TeacherAuthorization = 1,  // Autorización del docente
  StudentAuthorization = 2,  // Autorización de estudiantes
  SourceCode = 3,            // Código fuente (ZIP, repo, etc.)
  Presentation = 4,          // Presentación (diapositivas, video)
  Instrument = 5,            // Instrumentos de investigación
  Evidence = 6,              // Evidencias del desarrollo
  Other = 7                  // Otros anexos
}
```

**Labels en español:**
```typescript
const PpaAttachmentTypeLabels: Record<PpaAttachmentType, string> = {
  [PpaAttachmentType.PpaDocument]: 'Documento PPA',
  [PpaAttachmentType.TeacherAuthorization]: 'Autorización Docente',
  [PpaAttachmentType.StudentAuthorization]: 'Autorización Estudiantes',
  [PpaAttachmentType.SourceCode]: 'Código Fuente',
  [PpaAttachmentType.Presentation]: 'Presentación',
  [PpaAttachmentType.Instrument]: 'Instrumentos',
  [PpaAttachmentType.Evidence]: 'Evidencias',
  [PpaAttachmentType.Other]: 'Otros'
};
```

**Validación: Anexo requerido para estado Completed**
- Debe existir al menos un anexo de tipo `PpaDocument` (0) para cambiar a estado `Completed`
- ⚠️ Actualmente no validado en backend (pendiente implementación)

---

## 2. ENDPOINTS - Ppa

### 2.1 GET /api/Ppa/{id}

**Descripción:** Obtener detalle completo de un PPA

**Parámetros:**
- `id` (path, required): UUID del PPA

**Respuestas:**
- `200 OK`: `PpaDetailDto`
- `401 Unauthorized`: No autenticado
- `404 Not Found`: PPA no existe

**Permisos:**
- ADMIN: puede ver cualquier PPA
- DOCENTE: solo PPAs donde es responsable o está asignado

**Casos borde:**
- UUID inválido → 400 Bad Request
- PPA archivado → retorna normalmente

---

### 2.2 PUT /api/Ppa/{id}

**Descripción:** Actualizar un PPA existente

**Parámetros:**
- `id` (path, required): UUID del PPA

**Body:** `UpdatePpaCommand`

**Respuestas:**
- `200 OK`: Sin body (actualización exitosa)
- `400 Bad Request`: Validaciones fallidas
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos (no es responsable ni admin)
- `404 Not Found`: PPA no existe
- `409 Conflict`: Conflicto de negocio

**Permisos:**
- ADMIN: puede editar cualquier PPA en cualquier estado
- DOCENTE: solo puede editar PPAs propios (donde es responsable)
  - En estados `Proposal` e `InProgress`: puede editar todo
  - En estados `Completed` y `Archived`: NO puede cambiar responsable, asignaciones ni estudiantes

**Casos borde:**
- Cambiar docente responsable que no existe → 404
- Asignar teacher assignments de otro período → 400
- Docente intenta editar PPA archivado → 403

---

### 2.3 GET /api/Ppa/by-period

**Descripción:** Listar PPAs de un período académico

**Parámetros:**
- `academicPeriodId` (query, **REQUIRED**): UUID del período

**Respuestas:**
- `200 OK`: Array de `PpaDto`
- `400 Bad Request`: academicPeriodId vacío o inválido
- `401 Unauthorized`: No autenticado

**Permisos:**
- ADMIN: ve todos los PPAs del período
- DOCENTE: solo ve PPAs donde es responsable o está asignado

**Casos borde:**
- Parámetro omitido → 400 Bad Request
- Período sin PPAs → array vacío `[]`
- Período inexistente → array vacío `[]`

⚠️ **Sin paginación:** puede retornar muchos resultados

---

### 2.4 GET /api/Ppa/by-teacher

**Descripción:** Listar PPAs de un docente específico en un período

**Parámetros:**
- `teacherId` (query, **REQUIRED**): UUID del docente
- `academicPeriodId` (query, **REQUIRED**): UUID del período

**Respuestas:**
- `200 OK`: Array de `PpaDto`
- `400 Bad Request`: Algún parámetro vacío o inválido
- `401 Unauthorized`: No autenticado

**Permisos:**
- ADMIN: puede consultar cualquier docente
- DOCENTE: solo puede consultar sus propios PPAs

**Casos borde:**
- Omitir algún parámetro → 400 Bad Request
- Docente sin PPAs → array vacío `[]`
- Docente inexistente → array vacío `[]`

---

### 2.5 POST /api/Ppa

**Descripción:** Crear un nuevo PPA

**Body:** `CreatePpaCommand`

**Respuestas:**
- `201 Created`:
  - Body: `{ id: string, message: string }`
  - Header `Location`: `/api/Ppa/{id}`
- `400 Bad Request`: Validaciones fallidas
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permiso `ppa.create`
- `404 Not Found`: Período o asignaciones no existen

**Permisos:**
- ADMIN: puede crear PPAs para cualquier docente
- DOCENTE: puede crear PPAs (automáticamente se convierte en responsable)

**Casos borde:**
- Período académico inactivo → 400
- Teacher assignments de diferentes períodos → 400
- Array vacío de `teacherAssignmentIds` → 400 (minItems: 1)
- Estudiantes duplicados en array → permitido

**Estado inicial:** Siempre se crea en estado `Proposal` (0)

---

### 2.6 POST /api/Ppa/{id}/status

**Descripción:** Cambiar el estado de un PPA

**Parámetros:**
- `id` (path, required): UUID del PPA

**Body:** `ChangePpaStatusCommand`

**Respuestas:**
- `200 OK`: Sin body (cambio exitoso)
- `400 Bad Request`: Estado inválido
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permiso `ppa.change_status` (solo ADMIN)
- `404 Not Found`: PPA no existe
- `409 Conflict`: Transición no válida

**Permisos:**
- **SOLO ADMIN** puede cambiar estados
- DOCENTE: siempre 403 Forbidden

**Reglas de transición:**
- Desde `Archived` (3): ❌ NO se puede cambiar a ningún otro estado (terminal)
- Desde cualquier otro estado: ✅ Puede ir a cualquier estado (incluyendo regresiones)
- Mismo estado → mismo estado: permitido (200 OK, sin cambios)

**Casos borde:**
- `Archived` → `Proposal` → 409 Conflict
- `Completed` → `InProgress` → 200 OK (regresión permitida)
- `Proposal` → `Completed` → 200 OK (salto permitido)

⚠️ **Validación pendiente:** No valida que exista anexo `PpaDocument` antes de cambiar a `Completed`

---

### 2.7 GET /api/Ppa/my

**Descripción:** Obtener PPAs del usuario autenticado (según token)

**Parámetros:**
- `academicPeriodId` (query, **OPTIONAL**): UUID del período

**Respuestas:**
- `200 OK`: Array de `PpaSummaryDto`
- `400 Bad Request`: Parámetro inválido
- `401 Unauthorized`: No autenticado

**Comportamiento:**
- Si `academicPeriodId` se omite o es `null` → retorna PPAs de **todos** los períodos
- Si `academicPeriodId` se especifica → filtra por ese período

**Permisos:**
- ADMIN: retorna PPAs donde es responsable (no todos los del sistema)
- DOCENTE: retorna PPAs donde es responsable o está asignado

**Casos borde:**
- Usuario sin PPAs → array vacío `[]`
- Usuario sin rol DOCENTE → array vacío `[]`

---

### 2.8 GET /api/Ppa/{id}/history

**Descripción:** Obtener historial de cambios de un PPA

**Parámetros:**
- `id` (path, required): UUID del PPA

**Respuestas:**
- `200 OK`: Array de `PpaHistoryDto` (ordenado por `performedAt DESC`)
- `401 Unauthorized`: No autenticado
- `404 Not Found`: PPA no existe

**Permisos:**
- ADMIN: puede ver historial de cualquier PPA
- DOCENTE: solo historial de PPAs propios

**Casos borde:**
- PPA recién creado → array con 1 elemento (`Created`)
- PPA sin cambios → array con 1 elemento

---

### 2.9 POST /api/Ppa/{id}/continue

**Descripción:** Crear una continuación de un PPA en un nuevo período académico

**Parámetros:**
- `id` (path, required): UUID del PPA origen

**Body:** `ContinuePpaCommand`

**Respuestas:**
- `201 Created`:
  - Body: `{ id: string, message: string }` (ID del nuevo PPA creado)
  - Header `Location`: `/api/Ppa/{newId}`
- `400 Bad Request`: Validaciones fallidas
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos (no es responsable ni admin)
- `404 Not Found`: PPA origen o período destino no existen
- `409 Conflict`: Ya existe continuación o estado no permite

**Permisos:**
- ADMIN: puede continuar cualquier PPA
- DOCENTE: solo puede continuar PPAs donde es responsable

**Reglas de negocio:**
- PPA origen debe estar en estado `Completed` (2)
- PPA origen no debe tener ya una continuación (`hasContinuation = false`)
- Período destino debe ser posterior al período origen
- Se copia: título (o usa `newTitle`), descripción, objetivos
- Nuevo PPA inicia en estado `Proposal` (0)
- Nuevo PPA marca `isContinuation = true`

**Casos borde:**
- PPA origen en `Proposal` → 409 Conflict
- PPA origen ya tiene continuación → 409 Conflict
- Período destino anterior al origen → 400 Bad Request
- Teacher assignments del período origen en destino → permitido

---

## 3. ENDPOINTS - PpaAttachments

### 3.1 GET /api/PpaAttachments/by-ppa/{ppaId}

**Descripción:** Listar todos los anexos activos de un PPA

**Parámetros:**
- `ppaId` (path, required): UUID del PPA

**Respuestas:**
- `200 OK`: Array de `PpaAttachmentDto` (solo `isDeleted = false`)
- `401 Unauthorized`: No autenticado
- `404 Not Found`: PPA no existe

**Filtrado automático:** Backend filtra `isDeleted = true` automáticamente

**Permisos:**
- ADMIN: puede ver anexos de cualquier PPA
- DOCENTE: solo anexos de PPAs propios

**Casos borde:**
- PPA sin anexos → array vacío `[]`
- Anexos eliminados NO aparecen en el resultado

---

### 3.2 GET /api/PpaAttachments/by-ppa-and-type

**Descripción:** Listar anexos de un PPA filtrados por tipo

**Parámetros:**
- `ppaId` (query, required): UUID del PPA
- `type` (query, required): `PpaAttachmentType` (0-7)

**Respuestas:**
- `200 OK`: Array de `PpaAttachmentDto`
- `400 Bad Request`: Parámetros inválidos o tipo fuera de rango
- `401 Unauthorized`: No autenticado
- `404 Not Found`: PPA no existe

**Permisos:** Mismos que endpoint anterior

**Casos borde:**
- Tipo inexistente (8+) → 400 Bad Request
- PPA sin anexos de ese tipo → array vacío `[]`

---

### 3.3 POST /api/PpaAttachments/{ppaId}

**Descripción:** Agregar un anexo a un PPA

**Parámetros:**
- `ppaId` (path, required): UUID del PPA

**Body:** `AddPpaAttachmentRequest`

**Respuestas:**
- `201 Created`:
  - Body: `{ id: string, message: string }`
  - Header `Location`: `/api/PpaAttachments/{attachmentId}`
- `400 Bad Request`: Validaciones fallidas o fileKey inválido
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permiso `ppa.upload_file`
- `404 Not Found`: PPA no existe o fileKey no existe en MinIO

**Permisos:**
- ADMIN: puede agregar anexos a cualquier PPA
- DOCENTE: solo a PPAs donde es responsable o está asignado

**Flujo de subida:**
1. Frontend sube archivo a `POST /api/FileStorage/upload` → obtiene `fileKey`
2. Frontend llama a `POST /api/PpaAttachments/{ppaId}` con el `fileKey`

**Casos borde:**
- fileKey ya usado → permitido (mismo archivo en múltiples anexos)
- PPA en estado `Archived` → permitido (backend no valida estado)
- Archivo no existe en MinIO → 404 Not Found
- Sin límite de cantidad de anexos

---

### 3.4 DELETE /api/PpaAttachments/{attachmentId}

**Descripción:** Eliminar anexo (baja lógica: marca `isDeleted = true`)

**Parámetros:**
- `attachmentId` (path, required): UUID del anexo

**Respuestas:**
- `200 OK`: Sin body (eliminación exitosa)
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos
- `404 Not Found`: Anexo no existe

**Permisos:**
- ADMIN: puede eliminar cualquier anexo
- DOCENTE: solo anexos de PPAs donde es responsable o está asignado

**Casos borde:**
- Anexo ya eliminado (`isDeleted = true`) → 200 OK (idempotente)
- Último anexo `PpaDocument` en PPA `Completed` → permitido (no valida estado)

---

## 4. DTOS REQUEST

### 4.1 CreatePpaCommand

```typescript
interface CreatePpaCommand {
  title: string;                    // required, 3-300 chars
  description?: string | null;      // 0-3000 chars
  generalObjective?: string | null; // 0-1000 chars
  specificObjectives?: string | null; // 0-2000 chars
  academicPeriodId: string;         // required, UUID
  teacherAssignmentIds: string[];   // required, minItems: 1, UUIDs
  studentNames?: string[];          // optional, array de strings
}
```

**Validaciones:**
- `title`: min 3, max 300 caracteres
- `description`: max 3000 caracteres (puede ser null o vacío)
- `generalObjective`: max 1000 caracteres
- `specificObjectives`: max 2000 caracteres
- `teacherAssignmentIds`: mínimo 1 elemento, cada uno debe ser UUID válido
- `studentNames`: sin límite de elementos

---

### 4.2 UpdatePpaCommand

```typescript
interface UpdatePpaCommand {
  id: string;                           // required, UUID
  title: string;                        // required, 3-300 chars
  description?: string | null;          // 0-3000 chars
  generalObjective?: string | null;     // 0-1000 chars
  specificObjectives?: string | null;   // 0-2000 chars
  newResponsibleTeacherId?: string | null; // UUID
  newTeacherAssignmentIds?: string[] | null; // UUIDs
  newStudentNames?: string[] | null;    // array de strings
}
```

**Validaciones:** Mismas que `CreatePpaCommand` para campos comunes

**Restricciones por estado:**
- En `Completed` o `Archived` + rol DOCENTE:
  - NO puede cambiar: `newResponsibleTeacherId`, `newTeacherAssignmentIds`, `newStudentNames`
  - SÍ puede cambiar: `title`, `description`, `generalObjective`, `specificObjectives`
- ADMIN puede cambiar todo en cualquier estado

---

### 4.3 ChangePpaStatusCommand

```typescript
interface ChangePpaStatusCommand {
  id: string;           // required, UUID
  newStatus: number;    // required, PpaStatus (0-3)
}
```

**Validaciones:**
- `newStatus`: debe ser 0, 1, 2 o 3
- Transición desde `Archived` (3) → siempre 409 Conflict

---

### 4.4 ContinuePpaCommand

```typescript
interface ContinuePpaCommand {
  sourcePpaId: string;              // required, UUID
  targetAcademicPeriodId: string;   // required, UUID
  newTitle?: string | null;         // 3-300 chars si presente
  newResponsibleTeacherId?: string | null; // UUID
  teacherAssignmentIds: string[];   // required, minItems: 1
  studentNames?: string[];          // optional
}
```

**Validaciones:**
- `newTitle`: si se provee, 3-300 caracteres (si null, copia título original)
- `teacherAssignmentIds`: mínimo 1 elemento

---

### 4.5 AddPpaAttachmentRequest

```typescript
interface AddPpaAttachmentRequest {
  type: number;            // required, PpaAttachmentType (0-7)
  name: string;            // required, 1-300 chars
  fileKey: string;         // required, 1-500 chars
  contentType?: string | null; // 0-100 chars
}
```

**Validaciones:**
- `type`: debe ser 0-7
- `name`: min 1, max 300 caracteres
- `fileKey`: min 1, max 500 caracteres (obtenido de FileStorage)
- `contentType`: max 100 caracteres (MIME type)

---

## 5. DTOS RESPONSE

### 5.1 PpaDetailDto

```typescript
interface PpaDetailDto {
  id: string;                   // UUID
  title: string;
  description: string | null;
  generalObjective: string | null;
  specificObjectives: string | null;
  status: number;               // PpaStatus (0-3)
  academicPeriodId: string;     // UUID
  academicPeriodCode: string | null;
  primaryTeacherId: string;     // UUID
  primaryTeacherName: string | null;
  teacherAssignmentIds: string[]; // UUID[]
  createdAt: string;            // ISO 8601 date-time
  updatedAt: string | null;     // ISO 8601 date-time
}
```

---

### 5.2 PpaDto

```typescript
interface PpaDto {
  id: string;
  title: string;
  description: string | null;
  generalObjective: string | null;
  specificObjectives: string | null;
  status: number;               // PpaStatus
  academicPeriodId: string;
  primaryTeacherId: string;
  createdAt: string;
  updatedAt: string | null;
  teacherPrimaryName: string | null;
}
```

---

### 5.3 PpaSummaryDto

```typescript
interface PpaSummaryDto {
  id: string;
  title: string;
  status: number;               // PpaStatus
  academicPeriodId: string;
  academicPeriodCode: string | null;
  responsibleTeacherId: string;
  responsibleTeacherName: string | null;
  assignmentsCount: number;     // int32
  studentsCount: number;        // int32
  isContinuation: boolean;
  hasContinuation: boolean;
  createdAt: string;
  updatedAt: string | null;
}
```

---

### 5.4 PpaHistoryDto

```typescript
interface PpaHistoryDto {
  id: string;
  ppaId: string;
  performedByUserId: string;
  performedByUserName: string | null;
  performedAt: string;          // ISO 8601 date-time
  actionType: number;           // PpaHistoryActionType (0-12)
  actionTypeDescription: string;
  oldValue: string | null;
  newValue: string | null;
  notes: string | null;
}
```

---

### 5.5 PpaAttachmentDto

```typescript
interface PpaAttachmentDto {
  id: string;
  ppaId: string;
  type: number;                 // PpaAttachmentType (0-7)
  name: string;
  fileKey: string;
  contentType: string | null;
  uploadedByUserId: string;
  uploadedAt: string;           // ISO 8601 date-time
  isDeleted: boolean;           // Siempre false en responses (backend filtra true)
}
```

---

## 6. MÁQUINA DE ESTADOS

### Diagrama de transiciones

```
Proposal ──────────────► InProgress ──────────────► Completed ──────────────► Archived
    ▲                         ▲                         ▲                         │
    │                         │                         │                         │
    └─────────────────────────┴─────────────────────────┘                         │
    (Regresiones permitidas en estados no terminales)                             │
                                                                                   │
                                                                            (Terminal)
```

### Reglas implementadas

1. ✅ `Archived` es terminal: NO se puede cambiar desde este estado
2. ✅ Regresiones permitidas: `InProgress → Proposal`, `Completed → InProgress`, etc.
3. ✅ Saltos permitidos: `Proposal → Completed` sin pasar por `InProgress`
4. ⚠️ Validación pendiente: No requiere anexo `PpaDocument` para `Completed`

### Matriz de transiciones (ADMIN solamente)

| Desde \ Hacia | Proposal | InProgress | Completed | Archived |
|---------------|----------|------------|-----------|----------|
| **Proposal**  | ✅       | ✅         | ✅        | ✅       |
| **InProgress**| ✅       | ✅         | ✅        | ✅       |
| **Completed** | ✅       | ✅         | ✅        | ✅       |
| **Archived**  | ❌       | ❌         | ❌        | ✅       |

**Leyenda:**
- ✅ Permitido (200 OK)
- ❌ Prohibido (409 Conflict)

---

## 7. PERMISOS Y AUTORIZACIÓN

### Roles del sistema

```typescript
const ROLES = {
  ADMIN: 'ADMIN',       // Administrador (permisos completos)
  DOCENTE: 'DOCENTE'    // Docente (permisos limitados)
} as const;
```

### Matriz de permisos

| Acción         | Permiso                     | ADMIN       | DOCENTE                                  | Lógica adicional                                                        |
|----------------|-----------------------------|-------------|------------------------------------------|-------------------------------------------------------------------------|
| Ver PPAs       | `ppa.view_all` o `ppa.view_own` | ✅ view_all | ✅ view_own                              | DOCENTE solo ve PPAs donde es responsable o está asignado               |
| Crear PPA      | `ppa.create`                | ✅          | ✅                                       | Docente autenticado se convierte en responsable automáticamente         |
| Actualizar PPA | `ppa.update`                | ✅ Siempre  | ✅ Solo si es responsable                | En `Completed`/`Archived` solo ADMIN puede cambiar responsable/asignaciones |
| Cambiar estado | `ppa.change_status`         | ✅          | ❌                                       | Solo ADMIN puede cambiar estados                                        |
| Subir anexo    | `ppa.upload_file`           | ✅          | ✅ Solo PPAs propios                     | DOCENTE puede subir si es responsable o está asignado                   |
| Eliminar anexo | `ppa.upload_file`           | ✅          | ✅ Solo PPAs propios                     | Misma lógica que subir                                                  |
| Continuar PPA  | `ppa.create`                | ✅          | ✅ Solo si es responsable del PPA origen | -                                                                       |

### Lógica de permisos en frontend

```typescript
interface PpaPermissions {
  canView: boolean;
  canEdit: boolean;
  canChangeStatus: boolean;
  canUploadAttachment: boolean;
  canDeleteAttachment: boolean;
  canContinue: boolean;
  canChangeResponsible: boolean;
  canChangeAssignments: boolean;
}

function calculatePpaPermissions(
  ppa: PpaSummaryDto,
  currentUser: CurrentUser
): PpaPermissions {
  const isAdmin = currentUser.roles.includes('ADMIN');
  const isResponsible = ppa.responsibleTeacherId === currentUser.userId;
  // isAssigned requiere verificar contra teacherAssignmentIds (necesita fetch adicional)

  const isInEditableState =
    ppa.status !== PpaStatus.Completed &&
    ppa.status !== PpaStatus.Archived;

  return {
    canView: isAdmin || isResponsible,
    canEdit: isAdmin || (isResponsible && isInEditableState),
    canChangeStatus: isAdmin,
    canUploadAttachment: isAdmin || isResponsible,
    canDeleteAttachment: isAdmin || isResponsible,
    canContinue: isAdmin || isResponsible,
    canChangeResponsible: isAdmin || (isResponsible && isInEditableState),
    canChangeAssignments: isAdmin || (isResponsible && isInEditableState)
  };
}
```

---

## 8. VALIDACIONES Y LÍMITES

### Validaciones de campos (Commands)

| Campo                  | Min  | Max  | Required | Tipo   | Notas                          |
|------------------------|------|------|----------|--------|--------------------------------|
| title                  | 3    | 300  | ✅       | string | -                              |
| description            | 0    | 3000 | ❌       | string | Puede ser null                 |
| generalObjective       | 0    | 1000 | ❌       | string | Puede ser null                 |
| specificObjectives     | 0    | 2000 | ❌       | string | Puede ser null                 |
| teacherAssignmentIds   | 1    | -    | ✅       | array  | Mínimo 1 elemento              |
| name (attachment)      | 1    | 300  | ✅       | string | Nombre del archivo             |
| fileKey (attachment)   | 1    | 500  | ✅       | string | Key en MinIO                   |
| contentType (attachment)| 0   | 100  | ❌       | string | MIME type                      |

### Límites de archivos (Anexos)

⚠️ **Estado actual: Validaciones MÍNIMAS**

| Límite                        | Implementado | Valor actual    | Recomendación |
|-------------------------------|--------------|-----------------|---------------|
| Tamaño máximo por archivo     | ❌           | Sin límite      | 50 MB         |
| Cantidad máxima de anexos     | ❌           | Sin límite      | 20 por PPA    |
| Tipos MIME permitidos         | ❌           | Todos           | Ver lista     |

**Tipos MIME recomendados:**
```typescript
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'image/jpeg',
  'image/png',
  'application/zip',
  'text/plain'
];
```

**Validar en frontend antes de subir:**
```typescript
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `El archivo supera el límite de ${MAX_FILE_SIZE_MB}MB` };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido' };
  }

  return { valid: true };
}
```

---

## 9. CASOS BORDE

### 9.1 Creación de PPA

| Escenario                                      | Comportamiento esperado              | Código HTTP |
|------------------------------------------------|--------------------------------------|-------------|
| Período académico inactivo                     | Error de validación                  | 400         |
| Teacher assignments de diferentes períodos     | Error de validación                  | 400         |
| Array vacío de `teacherAssignmentIds`          | Error de validación (minItems: 1)    | 400         |
| Docente crea PPA (sin especificar responsable) | Usuario logueado es responsable      | 201         |
| Título duplicado en mismo período              | Permitido (sin validación unicidad)  | 201         |

### 9.2 Actualización de PPA

| Escenario                                      | Comportamiento esperado                   | Código HTTP |
|------------------------------------------------|-------------------------------------------|-------------|
| DOCENTE edita PPA `Archived`                   | Prohibido                                 | 403         |
| ADMIN edita PPA `Archived`                     | Permitido                                 | 200         |
| DOCENTE cambia responsable en `Completed`      | Prohibido                                 | 403         |
| ADMIN cambia responsable en `Completed`        | Permitido                                 | 200         |
| Cambiar a docente responsable inexistente      | Error de validación                       | 404         |
| Eliminar última asignación docente             | Sin validación (permitido)                | 200         |

### 9.3 Cambio de estado

| Escenario                          | Comportamiento esperado              | Código HTTP |
|------------------------------------|--------------------------------------|-------------|
| `Archived` → cualquier estado      | Prohibido (estado terminal)          | 409         |
| `Completed` → `InProgress`         | Permitido (regresión)                | 200         |
| `Proposal` → `Completed`           | Permitido (salto)                    | 200         |
| DOCENTE intenta cambiar estado     | Prohibido (solo ADMIN)               | 403         |
| Cambiar a mismo estado actual      | Permitido (sin cambios)              | 200         |
| `Proposal` → `Completed` sin anexos| Permitido (validación no implementada)| 200        |

### 9.4 Continuación de PPA

| Escenario                                  | Comportamiento esperado          | Código HTTP |
|--------------------------------------------|----------------------------------|-------------|
| PPA origen en `Proposal`                   | Prohibido                        | 409         |
| PPA origen ya tiene continuación           | Prohibido (`hasContinuation=true`)| 409        |
| Período destino anterior al origen         | Error de validación              | 400         |
| DOCENTE continúa PPA de otro docente       | Prohibido                        | 403         |
| Título nuevo muy corto (< 3 chars)         | Error de validación              | 400         |
| No especificar `newTitle`                  | Copia título original            | 201         |

### 9.5 Anexos

| Escenario                                | Comportamiento esperado              | Código HTTP |
|------------------------------------------|--------------------------------------|-------------|
| fileKey inexistente en MinIO             | Error                                | 404         |
| Subir anexo a PPA `Archived`             | Permitido (sin validación estado)    | 201         |
| Eliminar anexo ya eliminado              | Idempotente (sin error)              | 200         |
| Eliminar último `PpaDocument` en `Completed`| Permitido (sin validación)         | 200         |
| Mismo fileKey en múltiples anexos        | Permitido (mismo archivo reutilizado)| 201         |
| Archivo > 50MB                           | Backend: sin validación / Frontend: debe validar | - |

---

## 10. IMPLEMENTACIÓN FRONTEND

### 10.1 Estructura de archivos recomendada

```
src/modules/ppa/
├── types/
│   ├── ppa.types.ts           # DTOs (PpaDetailDto, PpaDto, etc.)
│   ├── ppa.enums.ts           # Enums (PpaStatus, PpaHistoryActionType, etc.)
│   └── ppa-attachment.types.ts
├── services/
│   ├── ppa.service.ts         # Llamadas API para Ppa
│   └── ppa-attachment.service.ts
├── hooks/
│   ├── usePpa.ts              # React Query hooks
│   ├── usePpaAttachments.ts
│   └── usePpaPermissions.ts   # Lógica de permisos
├── utils/
│   ├── ppa-state-machine.ts   # Validación de transiciones
│   └── ppa-validators.ts      # Validaciones client-side
├── components/
│   ├── PpaCard.tsx
│   ├── PpaForm.tsx
│   ├── PpaStatusBadge.tsx
│   ├── PpaHistory.tsx
│   └── PpaAttachments/
│       ├── AttachmentList.tsx
│       ├── AttachmentUpload.tsx
│       └── AttachmentCard.tsx
└── schemas/
    └── ppa.schemas.ts         # Zod schemas
```

### 10.2 Enums TypeScript

**Archivo: `src/modules/ppa/types/ppa.enums.ts`**

```typescript
export enum PpaStatus {
  Proposal = 0,
  InProgress = 1,
  Completed = 2,
  Archived = 3
}

export const PpaStatusLabels: Record<PpaStatus, string> = {
  [PpaStatus.Proposal]: 'Propuesta',
  [PpaStatus.InProgress]: 'En Progreso',
  [PpaStatus.Completed]: 'Completado',
  [PpaStatus.Archived]: 'Archivado'
};

export const PpaStatusColors: Record<PpaStatus, string> = {
  [PpaStatus.Proposal]: 'bg-[#9c0f06] text-white',
  [PpaStatus.InProgress]: 'bg-[#e30513] text-white',
  [PpaStatus.Completed]: 'bg-[#3c3c3b] text-white',
  [PpaStatus.Archived]: 'bg-[#630b00] text-white'
};

export enum PpaAttachmentType {
  PpaDocument = 0,
  TeacherAuthorization = 1,
  StudentAuthorization = 2,
  SourceCode = 3,
  Presentation = 4,
  Instrument = 5,
  Evidence = 6,
  Other = 7
}

export const PpaAttachmentTypeLabels: Record<PpaAttachmentType, string> = {
  [PpaAttachmentType.PpaDocument]: 'Documento PPA',
  [PpaAttachmentType.TeacherAuthorization]: 'Autorización Docente',
  [PpaAttachmentType.StudentAuthorization]: 'Autorización Estudiantes',
  [PpaAttachmentType.SourceCode]: 'Código Fuente',
  [PpaAttachmentType.Presentation]: 'Presentación',
  [PpaAttachmentType.Instrument]: 'Instrumentos',
  [PpaAttachmentType.Evidence]: 'Evidencias',
  [PpaAttachmentType.Other]: 'Otros'
};

export enum PpaHistoryActionType {
  Created = 0,
  UpdatedTitle = 1,
  ChangedStatus = 2,
  ChangedResponsibleTeacher = 3,
  UpdatedAssignments = 4,
  UpdatedStudents = 5,
  UpdatedContinuationSettings = 6,
  AttachmentAdded = 7,
  AttachmentRemoved = 8,
  ContinuationCreated = 9,
  UpdatedGeneralObjective = 10,
  UpdatedSpecificObjectives = 11,
  UpdatedDescription = 12
}

export const PpaHistoryActionLabels: Record<PpaHistoryActionType, string> = {
  [PpaHistoryActionType.Created]: 'Creación',
  [PpaHistoryActionType.UpdatedTitle]: 'Actualización de título',
  [PpaHistoryActionType.ChangedStatus]: 'Cambio de estado',
  [PpaHistoryActionType.ChangedResponsibleTeacher]: 'Cambio de responsable',
  [PpaHistoryActionType.UpdatedAssignments]: 'Actualización de asignaciones',
  [PpaHistoryActionType.UpdatedStudents]: 'Actualización de estudiantes',
  [PpaHistoryActionType.UpdatedContinuationSettings]: 'Actualización de configuración de continuación',
  [PpaHistoryActionType.AttachmentAdded]: 'Anexo agregado',
  [PpaHistoryActionType.AttachmentRemoved]: 'Anexo eliminado',
  [PpaHistoryActionType.ContinuationCreated]: 'Continuación creada',
  [PpaHistoryActionType.UpdatedGeneralObjective]: 'Actualización de objetivo general',
  [PpaHistoryActionType.UpdatedSpecificObjectives]: 'Actualización de objetivos específicos',
  [PpaHistoryActionType.UpdatedDescription]: 'Actualización de descripción'
};
```

### 10.3 Validación de transiciones de estado

**Archivo: `src/modules/ppa/utils/ppa-state-machine.ts`**

```typescript
import { PpaStatus } from '../types/ppa.enums';

export function canTransitionTo(
  currentStatus: PpaStatus,
  newStatus: PpaStatus,
  userRole: string
): boolean {
  // Solo ADMIN puede cambiar estados
  if (userRole !== 'ADMIN') return false;

  // No se puede salir de Archived
  if (currentStatus === PpaStatus.Archived) return false;

  // Mismo estado (sin cambios)
  if (currentStatus === newStatus) return true;

  // Cualquier otra transición es válida
  return true;
}

export function getAvailableTransitions(
  currentStatus: PpaStatus,
  userRole: string
): PpaStatus[] {
  if (userRole !== 'ADMIN' || currentStatus === PpaStatus.Archived) {
    return [];
  }

  return [
    PpaStatus.Proposal,
    PpaStatus.InProgress,
    PpaStatus.Completed,
    PpaStatus.Archived
  ].filter(s => s !== currentStatus);
}

export function isTerminalState(status: PpaStatus): boolean {
  return status === PpaStatus.Archived;
}

export function isEditableState(status: PpaStatus): boolean {
  return status === PpaStatus.Proposal || status === PpaStatus.InProgress;
}
```

### 10.4 Hook de permisos

**Archivo: `src/modules/ppa/hooks/usePpaPermissions.ts`**

```typescript
import { useMemo } from 'react';
import { PpaStatus } from '../types/ppa.enums';
import { PpaSummaryDto } from '../types/ppa.types';
import { useAuth } from '@/modules/auth/context/AuthProvider';

export interface PpaPermissions {
  canView: boolean;
  canEdit: boolean;
  canChangeStatus: boolean;
  canUploadAttachment: boolean;
  canDeleteAttachment: boolean;
  canContinue: boolean;
  canChangeResponsible: boolean;
  canChangeAssignments: boolean;
}

export function usePpaPermissions(ppa: PpaSummaryDto | null): PpaPermissions {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !ppa) {
      return {
        canView: false,
        canEdit: false,
        canChangeStatus: false,
        canUploadAttachment: false,
        canDeleteAttachment: false,
        canContinue: false,
        canChangeResponsible: false,
        canChangeAssignments: false
      };
    }

    const isAdmin = user.roles?.includes('ADMIN') ?? false;
    const isResponsible = ppa.responsibleTeacherId === user.userId;

    const isInEditableState =
      ppa.status !== PpaStatus.Completed &&
      ppa.status !== PpaStatus.Archived;

    return {
      canView: isAdmin || isResponsible,
      canEdit: isAdmin || (isResponsible && isInEditableState),
      canChangeStatus: isAdmin,
      canUploadAttachment: isAdmin || isResponsible,
      canDeleteAttachment: isAdmin || isResponsible,
      canContinue: isAdmin || isResponsible,
      canChangeResponsible: isAdmin || (isResponsible && isInEditableState),
      canChangeAssignments: isAdmin || (isResponsible && isInEditableState)
    };
  }, [user, ppa]);
}
```

### 10.5 Schemas de validación (Zod)

**Archivo: `src/modules/ppa/schemas/ppa.schemas.ts`**

```typescript
import { z } from 'zod';

export const createPpaSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(300, 'Máximo 300 caracteres'),
  description: z.string().max(3000, 'Máximo 3000 caracteres').nullable().optional(),
  generalObjective: z.string().max(1000, 'Máximo 1000 caracteres').nullable().optional(),
  specificObjectives: z.string().max(2000, 'Máximo 2000 caracteres').nullable().optional(),
  academicPeriodId: z.string().uuid('Debe ser un UUID válido'),
  teacherAssignmentIds: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos una asignación'),
  studentNames: z.array(z.string()).optional()
});

export const updatePpaSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(300),
  description: z.string().max(3000).nullable().optional(),
  generalObjective: z.string().max(1000).nullable().optional(),
  specificObjectives: z.string().max(2000).nullable().optional(),
  newResponsibleTeacherId: z.string().uuid().nullable().optional(),
  newTeacherAssignmentIds: z.array(z.string().uuid()).nullable().optional(),
  newStudentNames: z.array(z.string()).nullable().optional()
});

export const addAttachmentSchema = z.object({
  type: z.number().min(0).max(7),
  name: z.string().min(1).max(300),
  fileKey: z.string().min(1).max(500),
  contentType: z.string().max(100).nullable().optional()
});

export type CreatePpaFormData = z.infer<typeof createPpaSchema>;
export type UpdatePpaFormData = z.infer<typeof updatePpaSchema>;
export type AddAttachmentFormData = z.infer<typeof addAttachmentSchema>;
```

### 10.6 Servicio de API

**Archivo: `src/modules/ppa/services/ppa.service.ts`**

```typescript
import apiClient from '@/lib/apiClient';
import type {
  PpaDetailDto,
  PpaDto,
  PpaSummaryDto,
  PpaHistoryDto,
  CreatePpaCommand,
  UpdatePpaCommand,
  ChangePpaStatusCommand,
  ContinuePpaCommand
} from '../types/ppa.types';

export const ppaService = {
  getById: async (id: string): Promise<PpaDetailDto> => {
    const response = await apiClient<PpaDetailDto>(`/api/Ppa/${id}`, {
      method: 'GET'
    });
    return response;
  },

  update: async (id: string, data: UpdatePpaCommand): Promise<void> => {
    await apiClient(`/api/Ppa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  getByPeriod: async (academicPeriodId: string): Promise<PpaDto[]> => {
    const response = await apiClient<PpaDto[]>(
      `/api/Ppa/by-period?academicPeriodId=${academicPeriodId}`,
      { method: 'GET' }
    );
    return response;
  },

  getByTeacher: async (
    teacherId: string,
    academicPeriodId: string
  ): Promise<PpaDto[]> => {
    const response = await apiClient<PpaDto[]>(
      `/api/Ppa/by-teacher?teacherId=${teacherId}&academicPeriodId=${academicPeriodId}`,
      { method: 'GET' }
    );
    return response;
  },

  create: async (data: CreatePpaCommand): Promise<{ id: string; message: string }> => {
    const response = await apiClient<{ id: string; message: string }>('/api/Ppa', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },

  changeStatus: async (id: string, newStatus: number): Promise<void> => {
    await apiClient(`/api/Ppa/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ id, newStatus })
    });
  },

  getMy: async (academicPeriodId?: string): Promise<PpaSummaryDto[]> => {
    const url = academicPeriodId
      ? `/api/Ppa/my?academicPeriodId=${academicPeriodId}`
      : '/api/Ppa/my';
    const response = await apiClient<PpaSummaryDto[]>(url, { method: 'GET' });
    return response;
  },

  getHistory: async (id: string): Promise<PpaHistoryDto[]> => {
    const response = await apiClient<PpaHistoryDto[]>(`/api/Ppa/${id}/history`, {
      method: 'GET'
    });
    return response;
  },

  continue: async (
    id: string,
    data: ContinuePpaCommand
  ): Promise<{ id: string; message: string }> => {
    const response = await apiClient<{ id: string; message: string }>(
      `/api/Ppa/${id}/continue`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return response;
  }
};
```

### 10.7 React Query Hooks

**Archivo: `src/modules/ppa/hooks/usePpa.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ppaService } from '../services/ppa.service';
import type { CreatePpaCommand, UpdatePpaCommand } from '../types/ppa.types';

export const PPA_QUERY_KEYS = {
  all: ['ppas'] as const,
  detail: (id: string) => ['ppas', id] as const,
  byPeriod: (periodId: string) => ['ppas', 'period', periodId] as const,
  byTeacher: (teacherId: string, periodId: string) =>
    ['ppas', 'teacher', teacherId, periodId] as const,
  my: (periodId?: string) => ['ppas', 'my', periodId] as const,
  history: (id: string) => ['ppas', id, 'history'] as const
};

export function usePpaDetail(id: string) {
  return useQuery({
    queryKey: PPA_QUERY_KEYS.detail(id),
    queryFn: () => ppaService.getById(id),
    enabled: !!id
  });
}

export function usePpasByPeriod(academicPeriodId: string) {
  return useQuery({
    queryKey: PPA_QUERY_KEYS.byPeriod(academicPeriodId),
    queryFn: () => ppaService.getByPeriod(academicPeriodId),
    enabled: !!academicPeriodId
  });
}

export function useMyPpas(academicPeriodId?: string) {
  return useQuery({
    queryKey: PPA_QUERY_KEYS.my(academicPeriodId),
    queryFn: () => ppaService.getMy(academicPeriodId)
  });
}

export function useCreatePpa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePpaCommand) => ppaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PPA_QUERY_KEYS.all });
    }
  });
}

export function useUpdatePpa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePpaCommand }) =>
      ppaService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PPA_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PPA_QUERY_KEYS.all });
    }
  });
}

export function useChangePpaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: number }) =>
      ppaService.changeStatus(id, newStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PPA_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PPA_QUERY_KEYS.all });
    }
  });
}

export function usePpaHistory(id: string) {
  return useQuery({
    queryKey: PPA_QUERY_KEYS.history(id),
    queryFn: () => ppaService.getHistory(id),
    enabled: !!id
  });
}
```

### 10.8 Componente de Badge de Estado

**Archivo: `src/modules/ppa/components/PpaStatusBadge.tsx`**

```typescript
import { PpaStatus, PpaStatusLabels, PpaStatusColors } from '../types/ppa.enums';

interface PpaStatusBadgeProps {
  status: PpaStatus;
}

export function PpaStatusBadge({ status }: PpaStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${PpaStatusColors[status]}`}
    >
      {PpaStatusLabels[status]}
    </span>
  );
}
```

### 10.9 Notas importantes para implementación

1. **NO filtrar soft-delete client-side:**
   ```typescript
   // ❌ NO HACER
   const activeAttachments = attachments.filter(a => !a.isDeleted);

   // ✅ HACER (backend ya filtra)
   const attachments = await ppaService.getAttachments(ppaId);
   ```

2. **Validar archivos antes de subir:**
   ```typescript
   const MAX_FILE_SIZE_MB = 50;
   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

   function validateFile(file: File): { valid: boolean; error?: string } {
     if (file.size > MAX_FILE_SIZE_BYTES) {
       return {
         valid: false,
         error: `El archivo supera el límite de ${MAX_FILE_SIZE_MB}MB`
       };
     }
     return { valid: true };
   }
   ```

3. **Manejo de estados de carga:**
   ```typescript
   const { data: ppas, isLoading, error } = usePpasByPeriod(periodId);

   if (isLoading) return <PpaListSkeleton />;
   if (error) return <ErrorAlert message={error.message} />;
   if (!ppas || ppas.length === 0) return <EmptyState />;
   ```

4. **Optimistic updates para cambio de estado:**
   ```typescript
   const { mutate: changeStatus } = useChangePpaStatus();

   const handleStatusChange = (newStatus: PpaStatus) => {
     changeStatus(
       { id: ppa.id, newStatus },
       {
         onError: (error) => {
           toast.error('Error al cambiar estado');
         },
         onSuccess: () => {
           toast.success('Estado actualizado');
         }
       }
     );
   };
   ```

5. **Deshabilitar botones según permisos:**
   ```typescript
   const permissions = usePpaPermissions(ppa);

   <Button
     disabled={!permissions.canEdit}
     onClick={handleEdit}
   >
     Editar
   </Button>
   ```

---

## FIN DE ESPECIFICACIÓN

**Última actualización:** 2025-12-20
**Versión:** 1.0.0
**Estado:** Producción

Para cambios o aclaraciones, consultar con el equipo de backend.
