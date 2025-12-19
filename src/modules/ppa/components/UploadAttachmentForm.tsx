/**
 * Formulario para subir anexos a un PPA
 * Usa MinIO a través del backend
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { PpaAttachmentType } from '../types';
import { PpaAttachmentTypeLabels } from '../types';

// Schema de validación
const uploadSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.string().min(1, 'Selecciona un tipo de anexo'),
  file: z.instanceof(FileList).refine((files) => files.length > 0, 'Selecciona un archivo'),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadAttachmentFormProps {
  ppaId: string;
  onUploadSuccess: () => void;
}

export function UploadAttachmentForm({
  ppaId,
  onUploadSuccess,
}: UploadAttachmentFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PpaAttachmentType | ''>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const onSubmit = async (data: UploadFormData) => {
    setIsUploading(true);
    setError(null);

    try {
      const file = data.file[0];

      // Importar dinámicamente para evitar problemas de SSR
      const { uploadPpaAttachment } = await import('../api');

      // Subir archivo y crear anexo
      await uploadPpaAttachment(
        ppaId,
        file,
        selectedType as PpaAttachmentType,
        data.name
      );

      // Limpiar formulario
      reset();
      setSelectedType('');
      setValue('type', '');

      // Notificar éxito
      onUploadSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al subir el anexo. Intenta de nuevo.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-[#e30513]/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#630b00] flex items-center gap-2">
          <Upload className="h-5 w-5 text-[#e30513]" />
          Subir nuevo anexo
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error general */}
          {error && (
            <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#e30513]" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Tipo de anexo */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-[#3c3c3b] font-medium">
              Tipo de anexo
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value as PpaAttachmentType);
                setValue('type', value, { shouldValidate: true });
              }}
              disabled={isUploading}
            >
              <SelectTrigger className="border-[#3c3c3b]/20 focus:border-[#e30513]">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PpaAttachmentTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-[#e30513]">{errors.type.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#3c3c3b] font-medium">
              Nombre descriptivo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="ej: Propuesta de investigación 2024"
              disabled={isUploading}
              {...register('name')}
              className={`border-[#3c3c3b]/20 focus:border-[#e30513] ${
                errors.name ? 'border-[#e30513]' : ''
              }`}
            />
            {errors.name && (
              <p className="text-sm text-[#e30513]">{errors.name.message}</p>
            )}
          </div>

          {/* Archivo */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-[#3c3c3b] font-medium">
              Archivo
            </Label>
            <Input
              id="file"
              type="file"
              disabled={isUploading}
              {...register('file')}
              className={`border-[#3c3c3b]/20 focus:border-[#e30513] cursor-pointer ${
                errors.file ? 'border-[#e30513]' : ''
              }`}
            />
            {errors.file && (
              <p className="text-sm text-[#e30513]">{errors.file.message}</p>
            )}
            <p className="text-xs text-[#3c3c3b]/60">
              Formatos permitidos: PDF, Word, Excel, ZIP, imágenes
            </p>
          </div>

          {/* Botón de submit */}
          <Button
            type="submit"
            disabled={isUploading}
            className="w-full bg-[#e30513] hover:bg-[#9c0f06] text-white font-semibold rounded-lg transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir anexo
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
