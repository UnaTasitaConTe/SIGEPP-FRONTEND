"use client";

/**
 * Login Page - Página de inicio de sesión
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Mientras carga, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e30513] mx-auto"></div>
          <p className="mt-4 text-[#3c3c3b]">Validando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar el formulario
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f2f2f2] via-[#f2f2f2] to-[#e30513]/10 px-4 py-8">
      <LoginForm onSubmit={login} />
    </div>
  );
}
