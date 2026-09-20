import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientService, membershipService } from '../../api';
import { Client, Membership } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { Users, UserCheck, UserPlus, CreditCard } from 'lucide-react';

export const ReceptionDashboardPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [cList, mList] = await Promise.all([
          clientService.getClients().catch(() => []),
          membershipService.getMemberships().catch(() => []),
        ]);
        setClients(cList);
        setMemberships(mList);
      } catch (err) {
        console.error('Error loading receptionist dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <LoadingState message="Loading reception statistics..." />;

  const activeMembershipsCount = memberships.filter((m) => m.status === 'ACTIVE').length;
  const recentClients = clients.slice(-5).reverse();

  return (
    <div>
      <PageHeader
        title="Reception Dashboard"
        subtitle="Overview of clients, memberships, and quick receptionist operations"
        action={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/reception/clients/new">
              <Button variant="primary" size="sm" icon={<UserPlus size={16} />}>
                Register Client Account
              </Button>
            </Link>
            <Link to="/reception/memberships/new">
              <Button variant="secondary" size="sm" icon={<CreditCard size={16} />}>
                New Membership
              </Button>
            </Link>
          </div>
        }
      />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{clients.length}</div>
            <div className="stat-label">Total Clients</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-value">{activeMembershipsCount}</div>
            <div className="stat-label">Active Memberships</div>
          </div>
        </div>
      </div>

      <Card title="Recent Clients" action={<Link to="/reception/clients" style={{ fontSize: '0.875rem' }}>View All</Link>}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>DNI</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentClients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.firstName} {c.lastName}</strong>
                  </td>
                  <td>{c.dni}</td>
                  <td>{c.phone}</td>
                  <td>
                    <span className={`badge ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/reception/clients/${c.id}`} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
