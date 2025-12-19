/**
 * AssignmentCard - Card para mostrar una asignación docente-materia-período
 */

import { User, BookOpen, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { TeacherAssignmentDto } from '../types';

interface AssignmentCardProps {
  assignment: TeacherAssignmentDto;
  onClick?: () => void;
}

export function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
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
          <div className="flex items-center gap-2">
            {assignment.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <span
              className={`text-xs font-medium ${
                assignment.isActive ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              {assignment.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        {/* Docente */}
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-[#e30513] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#3c3c3b]/60 uppercase font-medium">
              Docente
            </p>
            <p className="text-sm text-[#630b00] font-semibold truncate">
              {assignment.teacherName || 'Sin nombre'}
            </p>
          </div>
        </div>

        {/* Materia */}
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-[#9c0f06] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#3c3c3b]/60 uppercase font-medium">
              Materia
            </p>
            <p className="text-sm text-[#3c3c3b] font-medium truncate">
              {assignment.subjectCode && assignment.subjectName
                ? `${assignment.subjectCode} - ${assignment.subjectName}`
                : assignment.subjectName || 'Sin nombre'}
            </p>
          </div>
        </div>

        {/* Período */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#630b00] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#3c3c3b]/60 uppercase font-medium">
              Período
            </p>
            <p className="text-sm text-[#3c3c3b] font-medium truncate">
              {assignment.academicPeriodName || 'Sin nombre'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
