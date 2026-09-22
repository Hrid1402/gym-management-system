import React, { useState, useEffect } from 'react';
import { membershipService, clientService, planService } from '../../api';
import { Membership, Client, MembershipPlan } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateForDisplay } from '../../utils/dateUtils';

type SortOption = 'default' | 'start_asc' | 'start_desc' | 'end_asc' | 'price_desc' | 'price_asc';

export const AdminMembershipsPage: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [mList, cList, pList] = await Promise.all([
          membershipService.getMemberships(),
          clientService.getClients(),
          planService.getPlans(),
        ]);
        setMemberships(mList);
        setClients(cList);
        setPlans(pList);
      } catch (err) {
        console.error('Error al cargar membresías:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const getClientName = (mem: Membership): string => {
    if (mem.clientName) return mem.clientName;
    const c = clients.find((client) => client.id === mem.clientId);
    return c ? `${c.firstName} ${c.lastName}` : 'Cliente';
  };

  const getClientDni = (mem: Membership): string => {
    if (mem.dni) return mem.dni;
    const c = clients.find((client) => client.id === mem.clientId);
    return c ? c.dni : '';
  };

  const getPlanName = (mem: Membership): string => {
    if (mem.planName) return mem.planName;
    const p = plans.find((plan) => plan.id === mem.planId);
    return p ? p.name : 'Plan de Membresía';
  };

  const getPrice = (mem: Membership): number | null => {
    if (mem.price !== undefined) return mem.price;
    const p = plans.find((plan) => plan.id === mem.planId);
    return p ? p.price : null;
  };

  // Filter & Sort Logic
  const filtered = memberships.filter((mem) => {
    const term = searchTerm.toLowerCase().trim();
    const cName = getClientName(mem).toLowerCase();
    const pName = getPlanName(mem).toLowerCase();
    const dni = getClientDni(mem).toLowerCase();
    const id = mem.id.toLowerCase();

    const matchesSearch = !term || cName.includes(term) || pName.includes(term) || dni.includes(term) || id.includes(term);
    const matchesStatus = statusFilter === 'ALL' || mem.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'start_asc') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    if (sortBy === 'start_desc') {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
    if (sortBy === 'end_asc') {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    if (sortBy === 'price_desc') {
      return (getPrice(b) || 0) - (getPrice(a) || 0);
    }
    if (sortBy === 'price_asc') {
      return (getPrice(a) || 0) - (getPrice(b) || 0);
    }
    return 0;
  });

  const isFiltered = searchTerm.trim() !== '' || statusFilter !== 'ALL' || sortBy !== 'default';

  if (loading) return <LoadingState message="Cargando membresías del sistema..." />;

  return (
    <div>
      <PageHeader title="Todas las Membresías" subtitle="Lista completa de suscripciones registradas" />

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
              {sorted.length} {sorted.length === 1 ? 'resultado' : 'resultados'} {isFiltered ? `(filtrados de ${memberships.length})` : 'total'}
            </span>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ minWidth: '180px', flex: '1 1 180px' }}>
              <Input
                placeholder="Buscar Cliente, DNI, Plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '160px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Todos los Estados' },
                  { value: 'ACTIVE', label: 'Activas' },
                  { value: 'CANCELLED', label: 'Canceladas' },
                  { value: 'PENDING', label: 'Pendientes' },
                  { value: 'EXPIRED', label: 'Vencidas' },
                ]}
              />
            </div>

            <div style={{ width: '180px' }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                options={[
                  { value: 'default', label: 'Orden: Por Defecto' },
                  { value: 'start_asc', label: 'Fecha Inicio (Más antigua)' },
                  { value: 'start_desc', label: 'Fecha Inicio (Más reciente)' },
                  { value: 'end_asc', label: 'Fecha Vencimiento (Próxima)' },
                  { value: 'price_desc', label: 'Precio: Mayor → Menor' },
                  { value: 'price_asc', label: 'Precio: Menor → Mayor' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No se encontraron membresías" description="No hay membresías de clientes que coincidan con los filtros actuales." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID Membresía</th>
                <th>Nombre del Cliente</th>
                <th>Plan</th>
                <th>Precio</th>
                <th>Fecha Inicio</th>
                <th>Fecha Vencimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((mem) => {
                const price = getPrice(mem);
                const dni = getClientDni(mem);
                return (
                  <tr key={mem.id}>
                    <td>
                      <code style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-neutral-100)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                        {mem.id}
                      </code>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: 'var(--color-neutral-900)', display: 'block' }}>
                          {getClientName(mem)}
                        </strong>
                        {dni && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                            DNI: {dni}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{getPlanName(mem)}</strong>
                    </td>
                    <td>
                      {price !== null ? (
                        <strong style={{ color: 'var(--color-primary)' }}>${price}</strong>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{mem.startDate ? formatDateForDisplay(mem.startDate) : '—'}</td>
                    <td>{mem.endDate ? formatDateForDisplay(mem.endDate) : '—'}</td>
                    <td>
                      <StatusBadge status={mem.status} />
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
