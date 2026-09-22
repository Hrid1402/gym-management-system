import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { UserCheck, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateForInput } from '../../utils/dateUtils';
import {
  validateName,
  validateDni,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validators';

export const ClientProfilePage: React.FC = () => {
  const { client, user, isLoading, updateProfile, changePassword } = useAuth();

  const [initialData, setInitialData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Change Password state
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [pwdTouched, setPwdTouched] = useState({ newPassword: false, confirmPassword: false });
  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    let data = {
      firstName: '',
      lastName: '',
      dni: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
    };
    if (client) {
      data = {
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        dni: client.dni || '',
        email: client.email || '',
        phone: client.phone || '',
        dateOfBirth: formatDateForInput(client.dateOfBirth),
        address: client.address || '',
      };
    } else if (user) {
      const parts = user.name ? user.name.split(' ') : ['', ''];
      data = {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        dni: '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        address: '',
      };
    }
    setInitialData(data);
    setFormData(data);
  }, [client, user]);

  // Real-time validation errors for profile form
  const fieldErrors = useMemo(() => {
    return {
      firstName: validateName(formData.firstName, 'El nombre'),
      lastName: validateName(formData.lastName, 'El apellido'),
      dni: validateDni(formData.dni),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
    };
  }, [formData]);

  const isProfileValid = useMemo(() => {
    return !Object.values(fieldErrors).some((err) => err !== null);
  }, [fieldErrors]);

  const isProfileDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const isProfileSaveDisabled = !isProfileDirty || !isProfileValid || saving;

  // Real-time validation errors for password form
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
    return <LoadingState message="Cargando datos de perfil..." />;
  }

  const handleChangeField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProfileSaveDisabled) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth ? formatDateForInput(formData.dateOfBirth) : null,
        address: formData.address,
      });
      setInitialData(formData);
      setTouched({});
      setSuccessMsg('¡Tus datos de perfil se han actualizado exitosamente!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
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

  return (
    <div>
      <PageHeader title="Mi Perfil y Configuración" subtitle="Gestiona los datos de tu cuenta y contraseña" />

      <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Card */}
        <Card title="Información Personal del Perfil">
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
              Actualiza tu información personal. Las modificaciones de correo se sincronizarán con tu cuenta de acceso.
            </div>
          </div>

          {successMsg && (
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
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
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
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitProfile}>
            <div className="form-grid-2">
              <Input
                label="Nombre"
                value={formData.firstName}
                onChange={(e) => handleChangeField('firstName', e.target.value)}
                error={touched.firstName ? fieldErrors.firstName || undefined : undefined}
                required
              />
              <Input
                label="Apellido"
                value={formData.lastName}
                onChange={(e) => handleChangeField('lastName', e.target.value)}
                error={touched.lastName ? fieldErrors.lastName || undefined : undefined}
                required
              />
            </div>

            <Input
              label="DNI / Documento de Identidad"
              value={formData.dni}
              onChange={(e) => handleChangeField('dni', e.target.value)}
              error={touched.dni ? fieldErrors.dni || undefined : undefined}
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

            <Input
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => handleChangeField('phone', e.target.value)}
              error={touched.phone ? fieldErrors.phone || undefined : undefined}
              placeholder="Ej: +54 9 11 1234-5678"
              required
            />

            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChangeField('dateOfBirth', e.target.value)}
            />

            <Input
              label="Dirección"
              value={formData.address}
              onChange={(e) => handleChangeField('address', e.target.value)}
              placeholder="Ej: Av. Principal 123"
            />

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" isLoading={saving} disabled={isProfileSaveDisabled}>
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
              Actualiza la contraseña de tu cuenta de cliente.
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
