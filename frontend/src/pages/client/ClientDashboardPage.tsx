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
      console.error('Error al cargar la membresía del cliente:', err);
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
      setCancelError(err.message || 'No se pudo cancelar la membresía');
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState message="Cargando información de tu membresía..." />;
  }

  const displayName = client
    ? `${client.firstName} ${client.lastName}`
    : user?.name || 'Cliente';

  const planTitle = plan?.name || membership?.planName || 'Plan de Membresía';
  const planPriceDisplay = plan?.price !== undefined ? `$${plan.price}` : '';
  const canCancel = membership?.status === 'ACTIVE' || membership?.status === 'PENDING';

  return (
    <div>
      <PageHeader
        title={`¡Bienvenido, ${displayName}!`}
        subtitle="Gestiona tu membresía y detalles de tu cuenta"
      />

      <div style={{ maxWidth: '650px' }}>
        <Card title="Estado Actual de tu Membresía">
          {membership ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    {planTitle}
                  </h4>
                  {planPriceDisplay && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                      Precio: {planPriceDisplay} {plan?.durationDays ? `(${plan.durationDays} días)` : ''}
                    </p>
                  )}
                </div>
                <StatusBadge status={membership.status} />
              </div>

              <div className="form-grid-2" style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-200)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> Fecha de Inicio
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-neutral-800)' }}>
                    {membership.startDate ? formatDateForDisplay(membership.startDate) : '—'}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> Fecha de Vencimiento
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
                    Cancelar Membresía
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <UserCheck size={48} style={{ color: 'var(--color-neutral-300)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                Sin membresía activa
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.25rem' }}>
                Actualmente no tienes una membresía activa en el gimnasio.
              </p>
              <Link to="/client/plans">
                <Button variant="primary" icon={<CreditCard size={16} />}>
                  Ver Planes Disponibles
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Advertencia de Cancelación de Membresía"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
              Conservar Membresía
            </Button>
            <Button variant="danger" onClick={handleCancelMembership} isLoading={cancelling}>
              Confirmar Cancelación
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={32} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
              ¿Estás seguro de que deseas cancelar tu membresía actual?
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginTop: '0.5rem' }}>
              Al cancelar tu membresía activa (<strong>{planTitle}</strong>), perderás los privilegios de acceso al gimnasio tras confirmar.
            </p>
            {cancelError && <div className="error-box" style={{ marginTop: '0.75rem' }}>{cancelError}</div>}
          </div>
        </div>
      </Modal>
    </div>
  );
};
