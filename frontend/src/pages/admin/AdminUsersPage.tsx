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
import { CheckCircle, XCircle, UserPlus, Info } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('RECEPTIONIST');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.isActive !== false : u.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const isFiltered = searchTerm.trim() !== '' || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  if (loading) return <LoadingState message="Loading staff users..." />;

  return (
    <div>
      <PageHeader
        title="Staff User Management"
        subtitle="Manage internal staff accounts (Admins, Receptionists), update roles, and grant/revoke access. Click any staff member to view full details."
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

      {/* Filter & Toolbar Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Result Counter Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                padding: '0.35rem 0.75rem',
                borderRadius: '16px',
                backgroundColor: isFiltered ? 'var(--color-primary-light, #e6f7ff)' : 'var(--color-neutral-200)',
                color: isFiltered ? 'var(--color-primary, #1890ff)' : 'var(--color-neutral-700)',
                border: isFiltered ? '1px solid #91d5ff' : '1px solid var(--color-neutral-300)',
              }}
            >
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} {isFiltered ? `(filtered from ${users.length})` : 'total'}
            </span>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ width: '220px' }}>
              <Input
                placeholder="Search Name or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '160px' }}>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Roles' },
                  { value: 'RECEPTIONIST', label: 'Receptionist' },
                  { value: 'ADMIN', label: 'Admin (Manager)' },
                ]}
              />
            </div>

            <div style={{ width: '150px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active Users' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          title="No staff users found"
          description="No staff accounts match your current filter criteria."
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    // Avoid opening modal if clicking dropdown or buttons directly
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.closest('button') || target.closest('select')) {
                      return;
                    }
                    setSelectedStaff(u);
                  }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: 'var(--color-neutral-900)' }}>{u.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center' }}>
                        <Info size={14} style={{ marginLeft: '4px' }} />
                      </span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <StatusBadge role={u.role} />
                  </td>
                  <td>
                    <StatusBadge isActive={u.isActive} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
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
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Info size={14} />}
                        onClick={() => setSelectedStaff(u)}
                      >
                        Details
                      </Button>
                      <Button
                        variant={u.isActive ? 'outline-danger' : 'secondary'}
                        size="sm"
                        icon={u.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff Details Modal */}
      {selectedStaff && (
        <Modal
          isOpen={!!selectedStaff}
          onClose={() => setSelectedStaff(null)}
          title="Staff Member Profile & Details"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  {selectedStaff.name}
                </h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>{selectedStaff.email}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <StatusBadge role={selectedStaff.role} />
                <StatusBadge isActive={selectedStaff.isActive} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ background: 'var(--color-neutral-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-500)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  User Database ID
                </div>
                <div style={{ fontFamily: 'monospace', color: 'var(--color-neutral-800)', wordBreak: 'break-all' }}>
                  {selectedStaff.id}
                </div>
              </div>

              <div style={{ background: 'var(--color-neutral-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-500)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Account Type
                </div>
                <div style={{ color: 'var(--color-neutral-800)', textTransform: 'capitalize', fontWeight: 600 }}>
                  Internal {selectedStaff.type || 'Staff'} Account
                </div>
              </div>

              <div style={{ background: 'var(--color-neutral-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-500)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  System Role
                </div>
                <div style={{ color: 'var(--color-neutral-800)', fontWeight: 600 }}>
                  {selectedStaff.role === 'ADMIN' ? 'Manager (Admin)' : selectedStaff.role}
                </div>
              </div>

              <div style={{ background: 'var(--color-neutral-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-500)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Account Created
                </div>
                <div style={{ color: 'var(--color-neutral-800)' }}>
                  {selectedStaff.createdAt ? new Date(selectedStaff.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-neutral-700)' }}>Change Role:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.875rem' }}
                  value={selectedStaff.role}
                  onChange={async (e) => {
                    const newRole = e.target.value as UserRole;
                    await handleRoleChange(selectedStaff, newRole);
                    setSelectedStaff({ ...selectedStaff, role: newRole });
                  }}
                >
                  <option value="ADMIN">ADMIN (Manager)</option>
                  <option value="RECEPTIONIST">RECEPTIONIST</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  variant={selectedStaff.isActive ? 'outline-danger' : 'secondary'}
                  size="sm"
                  icon={selectedStaff.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  onClick={async () => {
                    await handleToggleStatus(selectedStaff);
                    setSelectedStaff({ ...selectedStaff, isActive: !selectedStaff.isActive });
                  }}
                >
                  {selectedStaff.isActive ? 'Deactivate Staff Account' : 'Activate Staff Account'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setSelectedStaff(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
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
