"use client";

/**
 * LoginForm - Formulario de inicio de sesión
 */

import { useState, useId, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

// Schema de validación
const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const emailErrorId = useId();
  const passwordErrorId = useId();

  // Preload de la imagen del banner para evitar problemas de hidratación
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/FESC-BANNER.webp';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmitForm = async (data: LoginFormData) => {
    setError(null);

    try {
      await onSubmit(data.email, data.password);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión. Por favor, intenta de nuevo.";

      setError(message);

      // UX: enfoca el campo más probable
      if (errors.email) setFocus("email");
      else setFocus("password");
    }
  };

  return (
    <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 shadow-2xl rounded-2xl overflow-hidden bg-white lg:min-h-[640px]">
        {/* Panel Izquierdo - Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#e30513] via-[#9c0f06] to-[#630b00] p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/FESC-BANNER.webp"
              alt="FESC Banner"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 0vw, 50vw"
            />
          </div>
        </div>

      {/* Panel Derecho - Formulario */}
      <div className="p-8 lg:p-12 flex flex-col justify-center">
        {/* Logo móvil */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#630b00]">SIGEPP</h1>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Iniciar sesión</h2>
          <p className="text-[#3c3c3b]/60">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6" noValidate>
          {/* Error general */}
          {error && (
            <div
              role="alert"
              className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-4 py-3 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300"
            >
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#e30513]" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#3c3c3b] font-medium">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              disabled={isSubmitting}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? emailErrorId : undefined}
              {...register("email")}
              className={`h-12 border-[#3c3c3b]/20 focus:border-[#e30513] focus:ring-[#e30513]/20 transition-all ${
                errors.email ? "border-[#e30513] focus:border-[#e30513]" : ""
              }`}
            />
            {errors.email && (
              <p id={emailErrorId} className="text-sm text-[#e30513] flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#3c3c3b] font-medium">
                Contraseña
              </Label>

              {/* Si ya tienes la ruta, perfecto. Si no, déjalo así para luego */}
              <Link
                href="/forgot-password"
                className="text-sm text-[#e30513] hover:text-[#9c0f06] transition-colors font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isSubmitting}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? passwordErrorId : undefined}
                {...register("password")}
                className={`h-12 pr-12 border-[#3c3c3b]/20 focus:border-[#e30513] focus:ring-[#e30513]/20 transition-all ${
                  errors.password ? "border-[#e30513] focus:border-[#e30513]" : ""
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3c3c3b]/60 hover:text-[#e30513] transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {errors.password && (
              <p id={passwordErrorId} className="text-sm text-[#e30513] flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 bg-[#e30513] hover:bg-[#9c0f06] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#e30513]/20 hover:shadow-xl hover:shadow-[#9c0f06]/30"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
