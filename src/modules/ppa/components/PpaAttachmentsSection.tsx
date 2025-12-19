/**
 * Sección de anexos de un PPA
 * Muestra anexos agrupados por tipo y permite descargarlos
 */

'use client';

import { FileText, Download, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PpaAttachmentDto } from '../types';
import { PpaAttachmentTypeLabels, groupAttachmentsByType } from '../types';

interface PpaAttachmentsSectionProps {
  attachments: PpaAttachmentDto[];
  onDownload?: (attachment: PpaAttachmentDto) => void;
}

export function PpaAttachmentsSection({
  attachments,
  onDownload,
}: PpaAttachmentsSectionProps) {
  const groupedAttachments = groupAttachmentsByType(attachments);
  const attachmentTypes = Object.keys(groupedAttachments);

  if (attachments.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-[#3c3c3b]/20">
        <CardContent className="py-12">
          <div className="text-center text-[#3c3c3b]/60">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay anexos para este PPA</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {attachmentTypes.map((type) => {
        const typeAttachments = groupedAttachments[type as keyof typeof groupedAttachments];
        if (!typeAttachments || typeAttachments.length === 0) return null;

        return (
          <Card
            key={type}
            className="bg-white rounded-xl shadow-sm border border-[#e30513]/20"
          >
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#630b00] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#e30513]" />
                {PpaAttachmentTypeLabels[type as keyof typeof PpaAttachmentTypeLabels]}
                <span className="ml-auto text-sm font-normal text-[#3c3c3b]/60">
                  {typeAttachments.length}{' '}
                  {typeAttachments.length === 1 ? 'archivo' : 'archivos'}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {typeAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-start gap-4 p-3 rounded-lg border border-[#3c3c3b]/10 hover:border-[#e30513]/30 hover:bg-[#f2f2f2]/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#e30513]/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[#e30513]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#630b00] mb-1 truncate">
                        {attachment.name}
                      </h4>

                      <div className="flex flex-wrap gap-3 text-xs text-[#3c3c3b]/60">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(attachment.uploadedAt).toLocaleDateString(
                              'es-ES',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>

                        {attachment.contentType && (
                          <span className="px-2 py-0.5 bg-[#3c3c3b]/5 rounded">
                            {attachment.contentType}
                          </span>
                        )}
                      </div>
                    </div>

                    {onDownload && (
                      <Button
                        onClick={() => onDownload(attachment)}
                        size="sm"
                        variant="outline"
                        className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513] hover:text-white transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
