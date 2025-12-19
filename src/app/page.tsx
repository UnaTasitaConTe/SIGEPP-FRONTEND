"use client";

/**
 * Home Page - Redirige automáticamente al dashboard o login según autenticación
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  // Mostrar loader mientras se determina la ruta
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
