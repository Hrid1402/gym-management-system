import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientService } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { UserCheck, CheckCircle, AlertCircle } from 'lucide-react';

export const ClientProfilePage: React.FC = () => {
  const { client, user, isLoading, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setFirstName(client.firstName || '');
      setLastName(client.lastName || '');
      setPhone(client.phone || '');
      setDateOfBirth(client.dateOfBirth || '');
      setAddress(client.address || '');
    } else if (user) {
      const parts = user.name ? user.name.split(' ') : ['', ''];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [client, user]);

  if (isLoading) {
    return <LoadingState message="Loading profile information..." />;
  }

  const email = client?.email || user?.email || '';
  const dni = client?.dni || '—';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = client?.id || user?.id;
    if (!targetId) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await clientService.updateClient(targetId, {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        address,
      });
      await refreshProfile();
      setSuccessMsg('Your profile has been updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal contact details and information" />

      <div style={{ maxWidth: '650px' }}>
        <Card title="Personal Profile Information">
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
              Edit your contact info below. Your DNI and registered email are fixed account identifiers.
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

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="First Name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="DNI / Identification (Read-only)"
              value={dni}
              disabled
            />

            <Input
              label="Email Address (Read-only)"
              type="email"
              value={email}
              disabled
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-0199"
            />

            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />

            <Input
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, City"
            />

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
