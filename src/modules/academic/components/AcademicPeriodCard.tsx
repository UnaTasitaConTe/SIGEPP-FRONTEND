/**
 * AcademicPeriodCard - Card para mostrar un período académico
 */

import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPeriodDateRange } from '../types';
import type { AcademicPeriodDto } from '../types';

interface AcademicPeriodCardProps {
  period: AcademicPeriodDto;
  onClick?: () => void;
}

export function AcademicPeriodCard({ period, onClick }: AcademicPeriodCardProps) {
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
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#630b00] text-lg truncate">
              {period.name}
            </h3>
            <p className="text-xs text-[#3c3c3b]/60 font-mono mt-0.5">
              {period.code}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            {period.isActive ? (
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Activo</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                <XCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Inactivo</span>
              </div>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="flex items-center gap-2 text-sm text-[#3c3c3b]">
          <Calendar className="h-4 w-4 text-[#e30513] flex-shrink-0" />
          <span>{formatPeriodDateRange(period.startDate, period.endDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
