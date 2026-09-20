import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { planService } from '../../api';
import { MembershipPlan } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { PlusCircle, Edit, CheckCircle, XCircle } from 'lucide-react';

type PlanSortOption = 'name_asc' | 'price_asc' | 'price_desc' | 'duration_desc';

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Filters & Sort State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<PlanSortOption>('name_asc');

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
      await planService.updatePlanStatus(plan.id, !plan.isActive);
      await fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan status');
    }
  };

  const filtered = plans.filter((plan) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || plan.name.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? plan.isActive : !plan.isActive);
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'duration_desc') return b.durationDays - a.durationDays;
    return 0;
  });

  const isFiltered = searchTerm.trim() !== '' || statusFilter !== 'ALL' || sortBy !== 'name_asc';

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
              {sorted.length} {sorted.length === 1 ? 'plan' : 'plans'} {isFiltered ? `(filtered from ${plans.length})` : 'total'}
            </span>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ width: '220px' }}>
              <Input
                placeholder="Search Plan Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '150px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active Plans' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
              />
            </div>

            <div style={{ width: '170px' }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as PlanSortOption)}
                options={[
                  { value: 'name_asc', label: 'Sort: Name (A-Z)' },
                  { value: 'price_asc', label: 'Price: Low → High' },
                  { value: 'price_desc', label: 'Price: High → Low' },
                  { value: 'duration_desc', label: 'Duration (Days)' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No plans found" description="No membership plans match your filter criteria." />
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
              {sorted.map((plan) => (
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
