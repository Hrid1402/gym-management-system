import React, { useState, useEffect } from 'react';
import { clientService, membershipService } from '../../api';
import { Client, Membership } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';

type ClientSortOption = 'name_asc' | 'name_desc' | 'dni_asc';

export const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [membershipFilter, setMembershipFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<ClientSortOption>('name_asc');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cList, mList] = await Promise.all([
          clientService.getClients(),
          membershipService.getMemberships(),
        ]);
        setClients(cList);
        setMemberships(mList);
      } catch (err) {
        console.error('Failed to load admin client view:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getClientMembershipStatus = (clientId: string) => {
    const mems = memberships.filter((m) => m.clientId === clientId || !m.clientId);
    const active = mems.find((m) => m.status === 'ACTIVE');
    if (active) return 'ACTIVE';
    const pending = mems.find((m) => m.status === 'PENDING');
    if (pending) return 'PENDING';
    const cancelled = mems.find((m) => m.status === 'CANCELLED');
    if (cancelled) return 'CANCELLED';
    if (mems.length > 0) return 'EXPIRED';
    return undefined;
  };

  const filtered = clients.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch = !term || fullName.includes(term) || c.dni.toLowerCase().includes(term) || c.phone.includes(term) || (c.email && c.email.toLowerCase().includes(term));

    const matchesAccount = accountFilter === 'ALL' || (accountFilter === 'ACTIVE' ? c.isActive !== false : c.isActive === false);

    const memStatus = getClientMembershipStatus(c.id);
    const matchesMembership = membershipFilter === 'ALL' ||
      (membershipFilter === 'NONE' ? !memStatus : memStatus === membershipFilter);

    return matchesSearch && matchesAccount && matchesMembership;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name_asc') {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    }
    if (sortBy === 'name_desc') {
      return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
    }
    if (sortBy === 'dni_asc') {
      return a.dni.localeCompare(b.dni);
    }
    return 0;
  });

  const isFiltered = searchTerm.trim() !== '' || accountFilter !== 'ALL' || membershipFilter !== 'ALL' || sortBy !== 'name_asc';

  if (loading) return <LoadingState message="Loading client directory..." />;

  return (
    <div>
      <PageHeader title="Client Management" subtitle="Overview of all registered gym clients" />

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
              {sorted.length} {sorted.length === 1 ? 'client' : 'clients'} {isFiltered ? `(filtered from ${clients.length})` : 'total'}
            </span>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ width: '220px' }}>
              <Input
                placeholder="Search Name, DNI, Phone, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '150px' }}>
              <Select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Accounts' },
                  { value: 'ACTIVE', label: 'Active Users' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
              />
            </div>

            <div style={{ width: '160px' }}>
              <Select
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Memberships' },
                  { value: 'ACTIVE', label: 'Active Mem.' },
                  { value: 'PENDING', label: 'Pending Mem.' },
                  { value: 'CANCELLED', label: 'Cancelled Mem.' },
                  { value: 'NONE', label: 'No Membership' },
                ]}
              />
            </div>

            <div style={{ width: '150px' }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ClientSortOption)}
                options={[
                  { value: 'name_asc', label: 'Sort: Name (A-Z)' },
                  { value: 'name_desc', label: 'Sort: Name (Z-A)' },
                  { value: 'dni_asc', label: 'Sort: DNI' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No clients found" description="No registered clients match your filter criteria." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>DNI</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Account Status</th>
                <th>Membership</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((client) => {
                const memStatus = getClientMembershipStatus(client.id);
                return (
                  <tr key={client.id}>
                    <td>
                      <strong style={{ color: 'var(--color-neutral-900)' }}>
                        {client.firstName} {client.lastName}
                      </strong>
                    </td>
                    <td>{client.dni}</td>
                    <td>{client.phone}</td>
                    <td>{client.email || '—'}</td>
                    <td>
                      <StatusBadge isActive={client.isActive} />
                    </td>
                    <td>
                      {memStatus ? (
                        <StatusBadge status={memStatus} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
