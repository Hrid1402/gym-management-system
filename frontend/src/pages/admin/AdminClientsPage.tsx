import React, { useState, useEffect } from 'react';
import { clientService, membershipService } from '../../api';
import { Client, Membership } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

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

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return fullName.includes(term) || c.dni.toLowerCase().includes(term) || c.phone.includes(term);
  });

  const getClientMembershipStatus = (clientId: string) => {
    const mems = memberships.filter((m) => m.clientId === clientId);
    const active = mems.find((m) => m.status === 'ACTIVE');
    if (active) return 'ACTIVE';
    const pending = mems.find((m) => m.status === 'PENDING');
    if (pending) return 'PENDING';
    if (mems.length > 0) return 'EXPIRED';
    return undefined;
  };

  if (loading) return <LoadingState message="Loading client directory..." />;

  return (
    <div>
      <PageHeader title="Client Management" subtitle="Overview of all registered gym clients" />

      <div style={{ marginBottom: '1.25rem', maxWidth: '400px' }}>
        <Input
          placeholder="Search by Name, DNI, or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 ? (
        <EmptyState title="No clients found" description="No registered clients match the search term." />
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
              {filteredClients.map((client) => {
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
