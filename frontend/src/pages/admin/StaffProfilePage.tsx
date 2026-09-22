import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { UserCheck, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { ROLE_LABELS } from '../../config/appConfig';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validators';

export const StaffProfilePage: React.FC = () => {
  const { user, isLoading, updateProfile, changePassword } = useAuth();

  const [initialData, setInitialData] = useState({ name: '', email: '' });
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Change Password state
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [pwdTouched, setPwdTouched] = useState({ newPassword: false, confirmPassword: false });
  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || '',
        email: user.email || '',
      };
      setInitialData(data);
      setFormData(data);
    }
  }, [user]);

  // Real-time field validation for profile form
  const fieldErrors = useMemo(() => {
    return {
      name: validateName(formData.name, 'El nombre'),
      email: validateEmail(formData.email),
    };
  }, [formData]);

  const isProfileValid = !fieldErrors.name && !fieldErrors.email;
  const isProfileDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
  const isProfileSaveDisabled = !isProfileDirty || !isProfileValid || savingProfile;

  // Real-time field validation for password form
  const passwordErrors = useMemo(() => {
    return {
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
    };
  }, [newPassword, confirmPassword]);

  const isPasswordValid = !passwordErrors.newPassword && !passwordErrors.confirmPassword;
  const isPasswordDirty = newPassword.length > 0 || confirmPassword.length > 0;
  const isPasswordSaveDisabled = !isPasswordDirty || !isPasswordValid || changingPassword;

  if (isLoading) {
    return <LoadingState message="Cargando configuración de la cuenta..." />;
  }

  const handleChangeField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setProfileSuccess(null);
    setProfileError(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProfileSaveDisabled) return;

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
      });
      setInitialData(formData);
      setTouched({});
      setProfileSuccess('¡Datos de la cuenta actualizados exitosamente!');
    } catch (err: any) {
      setProfileError(err.message || 'Error al actualizar los datos del perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordSaveDisabled) return;

    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await changePassword(newPassword);
      setPasswordSuccess('¡Contraseña actualizada exitosamente!');
      setNewPassword('');
      setConfirmPassword('');
      setPwdTouched({ newPassword: false, confirmPassword: false });
    } catch (err: any) {
      setPasswordError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const userRoleLabel = user ? (ROLE_LABELS[user.role] || user.role) : '';

  return (
    <div>
      <PageHeader title="Perfil y Configuración de Personal" subtitle="Gestiona tu información de personal y contraseña" />

      <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Card */}
        <Card title="Detalles de Perfil de Personal">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--color-neutral-50)',
              color: 'var(--color-neutral-700)',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-neutral-200)',
            }}
          >
            <UserCheck size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              Rol actual: <strong>{userRoleLabel}</strong>. Las modificaciones en tu correo se sincronizarán con tu inicio de sesión.
            </div>
          </div>

          {profileSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f6ffed',
                color: '#389e0d',
                border: '1px solid #b7eb8f',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
              }}
            >
              <CheckCircle size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#fff2f0',
                color: '#cf1322',
                border: '1px solid #ffccc7',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <Input
              label="Nombre Completo"
              value={formData.name}
              onChange={(e) => handleChangeField('name', e.target.value)}
              error={touched.name ? fieldErrors.name || undefined : undefined}
              required
            />

            <Input
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={(e) => handleChangeField('email', e.target.value)}
              error={touched.email ? fieldErrors.email || undefined : undefined}
              required
            />

            <div style={{ marginTop: '1.25rem' }}>
              <Button type="submit" variant="primary" isLoading={savingProfile} disabled={isProfileSaveDisabled}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card title="Cambiar Contraseña">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <KeyRound size={20} style={{ color: 'var(--color-neutral-600)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
              Actualiza tu contraseña de acceso a continuación.
            </span>
          </div>

          {passwordSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f6ffed',
                color: '#389e0d',
                border: '1px solid #b7eb8f',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
              }}
            >
              <CheckCircle size={18} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#fff2f0',
                color: '#cf1322',
                border: '1px solid #ffccc7',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <Input
              label="Nueva Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwdTouched((prev) => ({ ...prev, newPassword: true }));
              }}
              error={pwdTouched.newPassword ? passwordErrors.newPassword || undefined : undefined}
              required
            />

            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              placeholder="Vuelve a ingresar la contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPwdTouched((prev) => ({ ...prev, confirmPassword: true }));
              }}
              error={pwdTouched.confirmPassword ? passwordErrors.confirmPassword || undefined : undefined}
              required
            />

            <div style={{ marginTop: '1.25rem' }}>
              <Button type="submit" variant="secondary" isLoading={changingPassword} disabled={isPasswordSaveDisabled}>
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
