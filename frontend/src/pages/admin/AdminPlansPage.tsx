import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { planService } from '../../api';
import { MembershipPlan } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { PlusCircle, Edit, CheckCircle, XCircle } from 'lucide-react';

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await planService.getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleToggleActive = async (plan: MembershipPlan) => {
    try {
      // Calls PATCH /api/plans/:id/status ({ is_active: !plan.isActive })
      await planService.updatePlanStatus(plan.id, !plan.isActive);
      await fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan status');
    }
  };

  if (loading) return <LoadingState message="Loading membership plans..." />;

  return (
    <div>
      <PageHeader
        title="Membership Plans"
        subtitle="Manage plan offerings, pricing, durations, and active states"
        action={
          <Link to="/admin/plans/new">
            <Button variant="primary" icon={<PlusCircle size={16} />}>
              Create New Plan
            </Button>
          </Link>
        }
      />

      {plans.length === 0 ? (
        <EmptyState title="No plans created" description="No membership plans exist yet." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Price ($)</th>
                <th>Duration (Days)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <strong style={{ color: 'var(--color-neutral-900)' }}>{plan.name}</strong>
                  </td>
                  <td>${plan.price}</td>
                  <td>{plan.durationDays} Days</td>
                  <td>
                    <StatusBadge isActive={plan.isActive} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Edit size={14} />}
                        onClick={() => navigate(`/admin/plans/${plan.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={plan.isActive ? 'outline-danger' : 'secondary'}
                        size="sm"
                        icon={plan.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        onClick={() => handleToggleActive(plan)}
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
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
