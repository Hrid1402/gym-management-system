import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../api';
import { User, UserRole } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckCircle, XCircle, UserPlus } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('RECEPTIONIST');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load staff users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setCreateError(null);

    try {
      await userService.createStaff({
        name,
        email,
        password,
        role,
      });
      setShowCreateModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('RECEPTIONIST');
      await fetchUsers();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create staff account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    if (newRole === user.role) return;
    try {
      await userService.updateUserRole(user.id, newRole);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await userService.deactivateUser(user.id);
      } else {
        await userService.activateUser(user.id);
      }
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  if (loading) return <LoadingState message="Loading staff users..." />;

  return (
    <div>
      <PageHeader
        title="Staff User Management"
        subtitle="Manage internal staff accounts (Admins, Receptionists), update roles, and grant/revoke access"
        action={
          <Button
            variant="primary"
            icon={<UserPlus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Staff Member
          </Button>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          title="No staff users displayed"
          description="There are currently no staff accounts registered."
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Status</th>
                <th>Change Role</th>
                <th>Account Status Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong style={{ color: 'var(--color-neutral-900)' }}>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <StatusBadge role={u.role} />
                  </td>
                  <td>
                    <StatusBadge isActive={u.isActive} />
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                    >
                      <option value="ADMIN">ADMIN (Manager)</option>
                      <option value="RECEPTIONIST">RECEPTIONIST</option>
                    </select>
                  </td>
                  <td>
                    <Button
                      variant={u.isActive ? 'outline-danger' : 'secondary'}
                      size="sm"
                      icon={u.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      onClick={() => handleToggleStatus(u)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Staff Member Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Staff Member"
      >
        <form onSubmit={handleCreateStaff}>
          {createError && <div className="error-box" style={{ marginBottom: '1rem' }}>{createError}</div>}

          <Input
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maria Gonzalez"
            required
          />

          <Input
            label="Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. maria@gym.com"
            required
          />

          <Input
            label="Initial Password *"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />

          <Select
            label="Staff Role *"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'RECEPTIONIST', label: 'Receptionist' },
              { value: 'ADMIN', label: 'Admin (Manager)' },
            ]}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
