/**
 * Barrel export para el módulo PPA
 * Facilita las importaciones desde otros módulos
 */

// Types
export type {
  PpaStatus,
  PpaAttachmentType,
  PpaDto,
  PpaDetailDto,
  PpaAttachmentDto,
  CreatePpaCommand,
  UpdatePpaCommand,
  ChangePpaStatusCommand,
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
  createPpa,
  updatePpa,
  changePpaStatus,
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
  usePpaAttachments,
  usePpaAttachmentsByType,
  useCreatePpa,
  useUpdatePpa,
  useChangePpaStatus,
  useAddPpaAttachment,
  useDeletePpaAttachment,
  useUploadPpaAttachment,
} from './hooks/usePpa';

// Components
export { PpaStatusBadge } from './components/PpaStatusBadge';
export { PpaCard } from './components/PpaCard';
export { PpaAttachmentsSection } from './components/PpaAttachmentsSection';
export { UploadAttachmentForm } from './components/UploadAttachmentForm';
export { PpaForm, type PpaFormData } from './components/PpaForm';
