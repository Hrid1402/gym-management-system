import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { clientService, membershipService } from '../../api';
import { Client, Membership } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserPlus, Eye, Edit } from 'lucide-react';

export const ReceptionClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cList, mList] = await Promise.all([
        clientService.getClients(),
        membershipService.getMemberships(),
      ]);
      setClients(cList);
      setMemberships(mList);
    } catch (err) {
      console.error('Failed to load client list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const dni = c.dni.toLowerCase();
    const phone = c.phone.toLowerCase();
    return fullName.includes(term) || dni.includes(term) || phone.includes(term);
  });

  const getClientActiveMembershipStatus = (clientId: string) => {
    const mems = memberships.filter((m) => m.clientId === clientId);
    const activeMem = mems.find((m) => m.status === 'ACTIVE');
    if (activeMem) return 'ACTIVE';
    const pendingMem = mems.find((m) => m.status === 'PENDING');
    if (pendingMem) return 'PENDING';
    if (mems.length > 0) return 'EXPIRED';
    return 'NO MEMBERSHIP';
  };

  if (loading) return <LoadingState message="Loading client directory..." />;

  return (
    <div>
      <PageHeader
        title="Clients Directory"
        subtitle="Manage registered clients, search profiles, and register new members"
        action={
          <Link to="/reception/clients/new">
            <Button variant="primary" icon={<UserPlus size={16} />}>
              Register New Client
            </Button>
          </Link>
        }
      />

      <div style={{ marginBottom: '1.25rem', maxWidth: '400px' }}>
        <Input
          placeholder="Search by Name, DNI, or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description={searchTerm ? `No clients matching "${searchTerm}"` : 'No clients registered yet.'}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>DNI</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Account State</th>
                <th>Membership</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const memStatus = getClientActiveMembershipStatus(client.id);
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
                      <StatusBadge status={memStatus === 'NO MEMBERSHIP' ? undefined : memStatus} />
                      {memStatus === 'NO MEMBERSHIP' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                          No Active Membership
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/reception/clients/${client.id}`}>
                          <Button variant="secondary" size="sm" icon={<Eye size={14} />}>
                            Details
                          </Button>
                        </Link>
                        <Link to={`/reception/clients/${client.id}/edit`}>
                          <Button variant="secondary" size="sm" icon={<Edit size={14} />}>
                            Edit
                          </Button>
                        </Link>
                      </div>
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
