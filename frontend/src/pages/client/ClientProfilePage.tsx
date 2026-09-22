import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { UserCheck, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateForInput } from '../../utils/dateUtils';

export const ClientProfilePage: React.FC = () => {
  const { client, user, isLoading, updateProfile, changePassword } = useAuth();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dni, setDni] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Change Password state
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setFirstName(client.firstName || '');
      setLastName(client.lastName || '');
      setDni(client.dni || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setDateOfBirth(formatDateForInput(client.dateOfBirth));
      setAddress(client.address || '');
    } else if (user) {
      const parts = user.name ? user.name.split(' ') : ['', ''];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
    }
  }, [client, user]);

  if (isLoading) {
    return <LoadingState message="Cargando datos de perfil..." />;
  }

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        dni,
        email,
        phone,
        date_of_birth: dateOfBirth ? formatDateForInput(dateOfBirth) : null,
        address,
      });
      setSuccessMsg('¡Tus datos de perfil se han actualizado exitosamente!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await changePassword(newPassword);
      setPasswordSuccess('¡Contraseña actualizada exitosamente!');
      setNewPassword('');
      setConfirmPassword('');
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="DNI / Documento de Identidad"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />

            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: +54 9 11 1234-5678"
            />

            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />

            <Input
              label="Dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Av. Principal 123"
            />

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" isLoading={saving}>
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
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              placeholder="Vuelve a ingresar la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div style={{ marginTop: '1.25rem' }}>
              <Button type="submit" variant="secondary" isLoading={changingPassword}>
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
