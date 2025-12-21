/**
 * Barrel export para el módulo PPA
 * Facilita las importaciones desde otros módulos
 */

// Types
export type {
  PpaStatus,
  PpaAttachmentType,
  PpaHistoryActionType,
  PpaDto,
  PpaDetailDto,
  PpaSummaryDto,
  PpaHistoryDto,
  PpaAttachmentDto,
  AssignmentDetail,
  PpaStudent,
  CreatePpaCommand,
  UpdatePpaCommand,
  ChangePpaStatusCommand,
  ContinuePpaCommand,
  AddPpaAttachmentRequest,
  CreatePpaAttachmentInput,
  FileUploadResult,
  TeacherAssignmentDisplay,
} from './types';

export {
  PpaStatusLabels,
  PpaAttachmentTypeLabels,
  PpaStatusToNumber,
  NumberToPpaStatus,
  PpaAttachmentTypeToNumber,
  NumberToPpaAttachmentType,
  getPpaStatusColor,
  groupAttachmentsByType,
} from './types';

// API
export {
  getPpasByTeacher,
  getPpasByPeriod,
  getPpaById,
  getMyPpas,
  getPpaHistory,
  createPpa,
  updatePpa,
  changePpaStatus,
  continuePpa,
  getPpaAttachments,
  getPpaAttachmentsByType,
  addPpaAttachment,
  deletePpaAttachment,
  uploadFile,
  getFileDownloadUrl,
  deleteFile,
  uploadPpaAttachment,
} from './api';

// Hooks
export {
  ppaKeys,
  usePpasByTeacher,
  usePpasByPeriod,
  usePpaDetail,
  useMyPpas,
  usePpaHistory,
  usePpaAttachments,
  usePpaAttachmentsByType,
  useCreatePpa,
  useUpdatePpa,
  useChangePpaStatus,
  useContinuePpa,
  useAddPpaAttachment,
  useDeletePpaAttachment,
  useUploadPpaAttachment,
} from './hooks/usePpa';

// Utilidades
export {
  canTransitionTo,
  getAvailableTransitions,
  isTerminalState,
  isEditableState,
  canChangeStructure,
  getNextSuggestedStatus,
} from './utils/ppa-state-machine';

// Hooks de permisos
export { usePpaPermissions, useCan } from './hooks/usePpaPermissions';

// Schemas de validación
export {
  createPpaSchema,
  updatePpaSchema,
  continuePpaSchema,
  addAttachmentSchema,
  validateFile,
  formatFileSize,
  FILE_UPLOAD_CONFIG,
} from './schemas/ppa.schemas';
export type {
  CreatePpaFormData,
  UpdatePpaFormData,
  ContinuePpaFormData,
  AddAttachmentFormData,
} from './schemas/ppa.schemas';

// Components
export { PpaStatusBadge } from './components/PpaStatusBadge';
export { PpaCard } from './components/PpaCard';
export { PpaAttachmentsSection } from './components/PpaAttachmentsSection';
export { UploadAttachmentForm } from './components/UploadAttachmentForm';
// Formularios para DOCENTES
export { CreatePpaForm } from './components/CreatePpaForm';
export { EditPpaForm } from './components/EditPpaForm';
// Formularios para ADMIN
export { AdminCreatePpaForm } from './components/AdminCreatePpaForm';
export { AdminEditPpaForm } from './components/AdminEditPpaForm';
// Mantener compatibilidad con código existente
export { PpaForm } from './components/PpaForm';
export type { PpaFormData } from './components/PpaForm';
// Otros componentes
export { PpaHistory } from './components/PpaHistory';
export { ContinuePpaDialog } from './components/ContinuePpaDialog';
