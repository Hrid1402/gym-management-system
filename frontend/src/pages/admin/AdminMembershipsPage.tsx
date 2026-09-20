import React, { useState, useEffect } from 'react';
import { membershipService, clientService, planService } from '../../api';
import { Membership, Client, MembershipPlan } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminMembershipsPage: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
        console.error('Failed to load memberships:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  if (loading) return <LoadingState message="Loading system memberships..." />;

  const getClientName = (clientId: string) => {
    const c = clients.find((client) => client.id === clientId);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown Client';
  };

  const getPlanName = (planId: string) => {
    const p = plans.find((plan) => plan.id === planId);
    return p ? p.name : 'Unknown Plan';
  };

  return (
    <div>
      <PageHeader title="All Memberships" subtitle="Complete list of all registered member subscriptions" />

      {memberships.length === 0 ? (
        <EmptyState title="No memberships found" description="No client memberships have been created yet." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Membership ID</th>
                <th>Client</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((mem) => (
                <tr key={mem.id}>
                  <td>
                    <code style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-neutral-100)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                      {mem.id}
                    </code>
                  </td>
                  <td>
                    <strong>{getClientName(mem.clientId)}</strong>
                  </td>
                  <td>{getPlanName(mem.planId)}</td>
                  <td>{mem.startDate}</td>
                  <td>{mem.endDate}</td>
                  <td>
                    <StatusBadge status={mem.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
