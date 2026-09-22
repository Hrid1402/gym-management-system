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
        console.error('Error al cargar clientes en gerencia:', err);
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

  if (loading) return <LoadingState message="Cargando directorio de clientes..." />;

  return (
    <div>
      <PageHeader title="Gestión de Clientes" subtitle="Visión global de todos los clientes registrados del gimnasio" />

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
              {sorted.length} {sorted.length === 1 ? 'cliente' : 'clientes'} {isFiltered ? `(filtrados de ${clients.length})` : 'total'}
            </span>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ minWidth: '180px', flex: '1 1 180px' }}>
              <Input
                placeholder="Buscar Nombre, DNI, Teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '150px' }}>
              <Select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Todas las Cuentas' },
                  { value: 'ACTIVE', label: 'Cuentas Activas' },
                  { value: 'INACTIVE', label: 'Cuentas Inactivas' },
                ]}
              />
            </div>

            <div style={{ width: '160px' }}>
              <Select
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Todas las Membresías' },
                  { value: 'ACTIVE', label: 'Membresía Activa' },
                  { value: 'PENDING', label: 'Membresía Pendiente' },
                  { value: 'CANCELLED', label: 'Membresía Cancelada' },
                  { value: 'NONE', label: 'Sin Membresía' },
                ]}
              />
            </div>

            <div style={{ width: '150px' }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ClientSortOption)}
                options={[
                  { value: 'name_asc', label: 'Orden: Nombre (A-Z)' },
                  { value: 'name_desc', label: 'Orden: Nombre (Z-A)' },
                  { value: 'dni_asc', label: 'Orden: DNI' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No se encontraron clientes" description="No hay clientes que coincidan con los criterios de búsqueda." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Estado de Cuenta</th>
                <th>Membresía</th>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Ninguna</span>
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
