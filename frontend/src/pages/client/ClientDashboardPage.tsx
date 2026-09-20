import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { membershipService, planService } from '../../api';
import { Membership, MembershipPlan } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { Modal } from '../../components/ui/Modal';
import { CreditCard, Calendar, UserCheck, AlertTriangle } from 'lucide-react';
import { formatDateForDisplay } from '../../utils/dateUtils';

export const ClientDashboardPage: React.FC = () => {
  const { client, user, isLoading: authLoading } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadClientData = useCallback(async () => {
    const targetId = client?.id || user?.id;
    if (!targetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const activeMem = await membershipService.getActiveClientMembership(targetId);
      setMembership(activeMem);
      if (activeMem && activeMem.planId) {
        try {
          const planData = await planService.getPlan(activeMem.planId);
          setPlan(planData);
        } catch {
          // Fallback to planName attached directly to activeMem
        }
      }
    } catch (err) {
      console.error('Failed to load client membership:', err);
    } finally {
      setLoading(false);
    }
  }, [client, user]);

  useEffect(() => {
    if (!authLoading) {
      loadClientData();
    }
  }, [authLoading, loadClientData]);

  const handleCancelMembership = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await membershipService.cancelCurrentClientMembership();
      setShowCancelModal(false);
      await loadClientData();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel membership');
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState message="Loading your membership details..." />;
  }

  const displayName = client
    ? `${client.firstName} ${client.lastName}`
    : user?.name || 'Member';

  const planTitle = plan?.name || membership?.planName || 'Membership Plan';
  const planPriceDisplay = plan?.price !== undefined ? `$${plan.price}` : '';
  const canCancel = membership?.status === 'ACTIVE' || membership?.status === 'PENDING';

  return (
    <div>
      <PageHeader
        title={`Welcome, ${displayName}!`}
        subtitle="Manage your gym membership and account details"
      />

      <div style={{ maxWidth: '650px' }}>
        <Card title="Current Membership Status">
          {membership ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    {planTitle}
                  </h4>
                  {planPriceDisplay && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                      Price: {planPriceDisplay} {plan?.durationDays ? `(${plan.durationDays} days)` : ''}
                    </p>
                  )}
                </div>
                <StatusBadge status={membership.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-200)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> Start Date
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-neutral-800)' }}>
                    {membership.startDate ? formatDateForDisplay(membership.startDate) : '—'}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> End Date
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-neutral-800)' }}>
                    {membership.endDate ? formatDateForDisplay(membership.endDate) : '—'}
                  </strong>
                </div>
              </div>

              {canCancel && (
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-200)' }}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Membership
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <UserCheck size={48} style={{ color: 'var(--color-neutral-300)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                No active membership
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.25rem' }}>
                You do not have an active gym membership at the moment.
              </p>
              <Link to="/client/plans">
                <Button variant="primary" icon={<CreditCard size={16} />}>
                  View Available Plans
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Membership Warning"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
              Keep Membership
            </Button>
            <Button variant="danger" onClick={handleCancelMembership} isLoading={cancelling}>
              Confirm Cancellation
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={32} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
              Are you sure you want to cancel your current membership?
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginTop: '0.5rem' }}>
              Cancelling your active membership (<strong>{planTitle}</strong>) will remove facility access privileges upon confirmation.
            </p>
            {cancelError && <div className="error-box" style={{ marginTop: '0.75rem' }}>{cancelError}</div>}
          </div>
        </div>
      </Modal>
    </div>
  );
};
