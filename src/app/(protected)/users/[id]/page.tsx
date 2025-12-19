/**
 * Página de detalle y edición de usuario
 * Ruta: /users/[id]
 *
 * Permite ver y gestionar un usuario específico
 */

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Key,
  Edit,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import {
  useUser,
  useUpdateUser,
  useActivateUser,
  useDeactivateUser,
  useChangeUserPassword,
} from '@/modules/users/hooks/useUsers';
import { UserStatusBadge } from '@/modules/users/components/UserStatusBadge';
import { RoleBadge } from '@/modules/users/components/RoleBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();

  // Estado para modo edición
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');

  // Estado para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Queries y mutations
  const { data: user, isLoading, error } = useUser(id);
  const updateMutation = useUpdateUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const changePasswordMutation = useChangeUserPassword();

  // Verificar que sea ADMIN
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  // Handlers
  const handleStartEdit = () => {
    if (user) {
      setEditedName(user.name);
      setEditedEmail(user.email);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
    setEditedEmail('');
  };

  const handleSaveEdit = async () => {
    if (!user) return;

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        command: {
          name: editedName,
          email: editedEmail,
        },
      });
      setIsEditing(false);
      alert('Usuario actualizado correctamente');
    } catch (error) {
      alert('Error al actualizar usuario');
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;

    try {
      if (user.isActive) {
        await deactivateMutation.mutateAsync(user.id);
        alert('Usuario desactivado');
      } else {
        await activateMutation.mutateAsync(user.id);
        alert('Usuario activado');
      }
    } catch (error) {
      alert('Error al cambiar estado del usuario');
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        id: user.id,
        request: { newPassword },
      });
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      alert('Contraseña cambiada correctamente');
    } catch (error) {
      alert('Error al cambiar contraseña');
    }
  };

  // Loading y error states
  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e30513] mx-auto" />
          <p className="mt-4 text-[#3c3c3b]">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Acceso no autorizado</h3>
              <p className="text-sm text-[#3c3c3b]/70">
                Solo los administradores pueden acceder a esta página.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#e30513]/5 border border-[#e30513]/20 text-[#630b00] px-6 py-8 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-[#e30513]" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Error al cargar usuario</h3>
              <p className="text-sm text-[#3c3c3b]/70 mb-4">
                No se pudo cargar la información del usuario.
              </p>
              <Link href="/users">
                <Button className="bg-[#e30513] hover:bg-[#9c0f06] text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Usuarios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header con navegación */}
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

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e30513] to-[#630b00] rounded-xl flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#630b00] mb-1">{user.name}</h1>
                <p className="text-sm text-[#3c3c3b]/60">Detalle del usuario</p>
              </div>
            </div>
            <UserStatusBadge isActive={user.isActive} />
          </div>
        </div>

        {/* Información básica */}
        <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#630b00]">
              Información Básica
            </CardTitle>
            {!isEditing ? (
              <Button
                onClick={handleStartEdit}
                variant="outline"
                size="sm"
                className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513] hover:text-white"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  disabled={updateMutation.isPending}
                  className="bg-[#e30513] hover:bg-[#9c0f06] text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="outline"
                  disabled={updateMutation.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="name" className="text-[#3c3c3b] font-medium">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-[#3c3c3b] font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="mt-1 border-[#3c3c3b]/20 focus:border-[#e30513]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-[#e30513] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase">
                      Nombre
                    </p>
                    <p className="text-sm text-[#3c3c3b] font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#e30513] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase">
                      Email
                    </p>
                    <p className="text-sm text-[#3c3c3b] font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#e30513] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#3c3c3b]/60 font-medium uppercase">
                      Creado
                    </p>
                    <p className="text-sm text-[#3c3c3b] font-medium">
                      {new Date(user.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Roles */}
        <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#630b00] flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#e30513]" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <div key={role.code} className="flex flex-col gap-1">
                    <RoleBadge roleCode={role.code} />
                    <p className="text-xs text-[#3c3c3b]/60">{role.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#3c3c3b]/60 italic">
                  Sin roles asignados
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card className="mb-6 bg-white rounded-xl shadow-sm border border-[#e30513]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#630b00]">
              Acciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Activar/Desactivar */}
            <div className="flex items-center justify-between p-4 bg-[#f2f2f2] rounded-lg">
              <div className="flex items-center gap-3">
                {user.isActive ? (
                  <XCircle className="h-5 w-5 text-orange-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className="font-medium text-[#630b00]">
                    {user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                  </p>
                  <p className="text-xs text-[#3c3c3b]/60">
                    {user.isActive
                      ? 'El usuario no podrá acceder al sistema'
                      : 'El usuario podrá acceder al sistema'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleToggleActive}
                disabled={
                  activateMutation.isPending || deactivateMutation.isPending
                }
                variant="outline"
                className={
                  user.isActive
                    ? 'border-orange-300 text-orange-700 hover:bg-orange-50'
                    : 'border-green-300 text-green-700 hover:bg-green-50'
                }
              >
                {user.isActive ? 'Desactivar' : 'Activar'}
              </Button>
            </div>

            {/* Cambiar contraseña */}
            <div className="p-4 bg-[#f2f2f2] rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Key className="h-5 w-5 text-[#e30513]" />
                <div className="flex-1">
                  <p className="font-medium text-[#630b00]">Cambiar contraseña</p>
                  <p className="text-xs text-[#3c3c3b]/60">
                    Establecer una nueva contraseña para este usuario
                  </p>
                </div>
                {!isChangingPassword && (
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    variant="outline"
                    size="sm"
                    className="border-[#e30513]/30 text-[#e30513] hover:bg-[#e30513] hover:text-white"
                  >
                    Cambiar
                  </Button>
                )}
              </div>

              {isChangingPassword && (
                <div className="space-y-3 mt-4 pt-4 border-t border-[#3c3c3b]/10">
                  <div>
                    <Label htmlFor="newPassword" className="text-sm">
                      Nueva contraseña
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm">
                      Confirmar contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1"
                      placeholder="Repetir contraseña"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending}
                      className="bg-[#e30513] hover:bg-[#9c0f06] text-white"
                      size="sm"
                    >
                      Guardar contraseña
                    </Button>
                    <Button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      variant="outline"
                      size="sm"
                      disabled={changePasswordMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
