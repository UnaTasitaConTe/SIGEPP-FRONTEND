'use client';

import { usePpaHistory } from '../hooks/usePpa';
import type { PpaHistoryDto } from '../types';
import {
  FileText,
  Edit,
  RefreshCw,
  UserCheck,
  Users,
  Link2,
  FilePlus,
  FileX,
  GitBranch,
  Target,
  List,
  AlignLeft
} from 'lucide-react';

interface PpaHistoryProps {
  ppaId: string;
}

const actionTypeIcons: Record<string, React.ReactNode> = {
  Created: <FilePlus className="h-4 w-4" />,
  UpdatedTitle: <Edit className="h-4 w-4" />,
  ChangedStatus: <RefreshCw className="h-4 w-4" />,
  ChangedResponsibleTeacher: <UserCheck className="h-4 w-4" />,
  UpdatedAssignments: <Users className="h-4 w-4" />,
  UpdatedStudents: <Users className="h-4 w-4" />,
  UpdatedContinuationSettings: <Link2 className="h-4 w-4" />,
  AttachmentAdded: <FilePlus className="h-4 w-4" />,
  AttachmentRemoved: <FileX className="h-4 w-4" />,
  ContinuationCreated: <GitBranch className="h-4 w-4" />,
  UpdatedGeneralObjective: <Target className="h-4 w-4" />,
  UpdatedSpecificObjectives: <List className="h-4 w-4" />,
  UpdatedDescription: <AlignLeft className="h-4 w-4" />,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function HistoryEntry({ entry }: { entry: PpaHistoryDto }) {
  const icon = actionTypeIcons[entry.actionType] || <FileText className="h-4 w-4" />;

  return (
    <div className="relative pb-8 last:pb-0">
      {/* Línea conectora */}
      <span
        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
        aria-hidden="true"
      />

      <div className="relative flex items-start space-x-3">
        {/* Ícono */}
        <div className="relative">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e30513] text-white">
            {icon}
          </div>
        </div>

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          <div>
            <div className="text-sm">
              <span className="font-medium text-[#3c3c3b]">
                {entry.performedByUserName || 'Usuario desconocido'}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {formatDate(entry.performedAt)}
            </p>
          </div>

          <div className="mt-2 text-sm text-gray-700">
            <p className="font-medium">{entry.actionTypeDescription}</p>

            {(entry.oldValue || entry.newValue) && (
              <div className="mt-2 rounded-md bg-gray-50 p-3 text-xs">
                {entry.oldValue && (
                  <div className="mb-1">
                    <span className="font-semibold text-gray-600">Anterior:</span>{' '}
                    <span className="text-gray-700">{entry.oldValue}</span>
                  </div>
                )}
                {entry.newValue && (
                  <div>
                    <span className="font-semibold text-gray-600">Nuevo:</span>{' '}
                    <span className="text-gray-700">{entry.newValue}</span>
                  </div>
                )}
              </div>
            )}

            {entry.notes && (
              <p className="mt-2 italic text-gray-600">{entry.notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PpaHistory({ ppaId }: PpaHistoryProps) {
  const { data: history, isLoading, error } = usePpaHistory(ppaId);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#e30513]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-800">
          Error al cargar el historial: {error.message}
        </p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-center text-sm text-gray-500">
          No hay historial disponible para este PPA.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-lg font-semibold text-[#3c3c3b]">
        Historial de Cambios
      </h3>

      <div className="flow-root">
        <ul className="-mb-8">
          {history.map((entry) => (
            <li key={entry.id}>
              <HistoryEntry entry={entry} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
