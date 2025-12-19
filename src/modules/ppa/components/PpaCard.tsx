/**
 * Card para mostrar un PPA en la lista
 * Diseño siguiendo paleta corporativa SIGEPP
 */

import Link from 'next/link';
import { Calendar, User, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PpaDto } from '../types';
import { PpaStatusBadge } from './PpaStatusBadge';

interface PpaCardProps {
  ppa: PpaDto;
}

export function PpaCard({ ppa }: PpaCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-[#630b00] flex-1">
            {ppa.title}
          </CardTitle>
          <PpaStatusBadge status={ppa.status} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Período académico */}
          <div className="flex items-center gap-2 text-sm text-[#3c3c3b]/70">
            <Calendar className="h-4 w-4 text-[#e30513]" />
            <span>{ppa.academicPeriodName}</span>
          </div>

          {/* Docente */}
          <div className="flex items-center gap-2 text-sm text-[#3c3c3b]/70">
            <User className="h-4 w-4 text-[#e30513]" />
            <span>{ppa.teacherName}</span>
          </div>

          {/* Fecha de creación */}
          <div className="flex items-center gap-2 text-sm text-[#3c3c3b]/70">
            <FileText className="h-4 w-4 text-[#e30513]" />
            <span>
              Creado el {new Date(ppa.createdAt).toLocaleDateString('es-ES')}
            </span>
          </div>

          {/* Botón de ver detalle */}
          <div className="pt-4">
            <Link href={`/ppa/${ppa.id}`}>
              <Button className="w-full bg-[#e30513] hover:bg-[#9c0f06] text-white font-medium rounded-lg transition-colors">
                Ver detalle
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
