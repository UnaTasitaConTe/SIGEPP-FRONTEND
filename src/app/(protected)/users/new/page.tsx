/**
 * Página para crear nuevo usuario
 * Ruta: /users/new
 *
 * Permite a los administradores crear nuevos usuarios en el sistema
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useCreateUser } from '@/modules/users/hooks/useUsers';
import { UserRole, UserRoleLabels, UserRoleDescriptions } from '@/modules/users/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function NewUserPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const createMutation = useCreateUser();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isActive: true,
  });

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Verificar que sea ADMIN
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.email || !formData.email.includes('@')) {
      errors.email = 'Email inválido';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (selectedRoles.length === 0) {
      errors.roles = 'Debes seleccionar al menos un rol';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler para submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        rawPassword: formData.password,
        roleCodes: selectedRoles,
        isActive: formData.isActive,
      });

      alert('Usuario creado correctamente');
      router.push('/users');
    } catch (error) {
      alert('Error al crear usuario');
    }
  };

  // Handler para togglear roles
  const toggleRole = (roleCode: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleCode)
        ? prev.filter((r) => r !== roleCode)
        : [...prev, roleCode]
    );
    // Limpiar error de roles
    if (formErrors.roles) {
      setFormErrors((prev) => ({ ...prev, roles: '' }));
    }
  };

  // Loading
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e30513] mx-auto" />
          <p className="mt-4 text-[#3c3c3b]">Cargando...</p>
        </div>
      </div>
    );
  }

  // Check admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Acceso no autorizado</h3>
              <p className="text-sm text-[#3c3c3b]/70">
                Solo los administradores pueden crear usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/users">
            <Button
              variant="ghost"
              className="text-[#3c3c3b] hover:text-[#e30513] hover:bg-[#e30513]/5 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Usuarios
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#630b00]">Nuevo Usuario</h1>
              <p className="text-sm text-[#3c3c3b]/60">
                Crear un nuevo usuario en el sistema
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#630b00]">
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre */}
              <div>
                <Label htmlFor="name" className="text-[#3c3c3b] font-medium">
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`mt-1 ${
                    formErrors.name ? 'border-red-500' : 'border-[#3c3c3b]/20'
                  } focus:border-[#e30513]`}
                  placeholder="Ej: Juan Pérez"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-[#3c3c3b] font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`mt-1 ${
                    formErrors.email ? 'border-red-500' : 'border-[#3c3c3b]/20'
                  } focus:border-[#e30513]`}
                  placeholder="usuario@example.com"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <Label htmlFor="password" className="text-[#3c3c3b] font-medium">
                  Contraseña *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`mt-1 ${
                    formErrors.password ? 'border-red-500' : 'border-[#3c3c3b]/20'
                  } focus:border-[#e30513]`}
                  placeholder="Mínimo 6 caracteres"
                />
                {formErrors.password && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-[#3c3c3b] font-medium"
                >
                  Confirmar contraseña *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className={`mt-1 ${
                    formErrors.confirmPassword
                      ? 'border-red-500'
                      : 'border-[#3c3c3b]/20'
                  } focus:border-[#e30513]`}
                  placeholder="Repetir contraseña"
                />
                {formErrors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#630b00]">
                Roles *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.values(UserRole).map((role) => (
                <div
                  key={role}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRoles.includes(role)
                      ? 'border-[#e30513] bg-[#e30513]/5'
                      : 'border-[#3c3c3b]/10 hover:border-[#e30513]/30'
                  }`}
                  onClick={() => toggleRole(role)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-[#630b00]">
                        {UserRoleLabels[role]}
                      </p>
                      <p className="text-sm text-[#3c3c3b]/70">
                        {UserRoleDescriptions[role]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {formErrors.roles && (
                <p className="text-xs text-red-600">{formErrors.roles}</p>
              )}
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#e30513] hover:bg-[#9c0f06] text-white flex-1"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Usuario
                </>
              )}
            </Button>
            <Link href="/users" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
