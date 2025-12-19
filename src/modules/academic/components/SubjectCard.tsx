/**
 * SubjectCard - Card para mostrar una asignatura
 */

import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SubjectDto } from '../types';

interface SubjectCardProps {
  subject: SubjectDto;
  onClick?: () => void;
}

export function SubjectCard({ subject, onClick }: SubjectCardProps) {
  return (
    <Card
      className={`border-[#e30513]/20 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl ${
        onClick ? 'cursor-pointer hover:border-[#e30513]/40' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Header con estado */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#9c0f06] to-[#630b00] flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#630b00] truncate">
                {subject.name}
              </h3>
              <p className="text-xs text-[#3c3c3b]/60 font-mono mt-0.5">
                {subject.code}
              </p>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            {subject.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Descripción */}
        {subject.description && (
          <p className="text-sm text-[#3c3c3b]/70 line-clamp-2">
            {subject.description}
          </p>
        )}

        {/* Badge de estado */}
        <div className="mt-3 flex items-center">
          <span
            className={`text-xs px-2 py-1 rounded-md font-medium ${
              subject.isActive
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            {subject.isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
