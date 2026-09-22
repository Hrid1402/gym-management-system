import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { planService, membershipService } from '../../api';
import { MembershipPlan, Membership } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { formatDateForDisplay } from '../../utils/dateUtils';

export const ClientMembershipPage: React.FC = () => {
  const { client, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdMembership, setCreatedMembership] = useState<Membership | null>(null);

  const [activeMem, setActiveMem] = useState<Membership | null>(null);

  const preselectedPlanId = searchParams.get('planId');

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const targetId = client?.id || user?.id;
      if (targetId) {
        try {
          const existingMem = await membershipService.getActiveClientMembership(targetId);
          if (existingMem && (existingMem.status === 'ACTIVE' || existingMem.status === 'PENDING')) {
            setActiveMem(existingMem);
            setLoadingPlans(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      const activePlans = await planService.getActivePlans();
      setPlans(activePlans);
      if (preselectedPlanId && activePlans.some((p) => p.id === preselectedPlanId)) {
        setSelectedPlanId(preselectedPlanId);
      } else if (activePlans.length > 0) {
        setSelectedPlanId(activePlans[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar los planes');
    } finally {
      setLoadingPlans(false);
    }
  }, [preselectedPlanId, client, user]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  if (loadingPlans) return <LoadingState message="Cargando información de membresía..." />;

  if (activeMem) {
    return (
      <div>
        <PageHeader title="Adquirir Membresía" subtitle="La adquisición de membresía está restringida" />
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <AlertTriangle size={56} style={{ color: 'var(--color-warning)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                Ya tienes una membresía activa
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Actualmente posees una membresía activa (<strong>{activeMem.planName || 'Plan Actual'}</strong>). El sistema no permite adquirir múltiples membresías simultáneas. Para contratar un nuevo plan, debes cancelar primero tu membresía vigente.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={() => navigate('/client/plans')}>
                  Explorar Planes
                </Button>
                <Button variant="primary" onClick={() => navigate('/client')}>
                  Ir al Inicio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setErrorMsg('Por favor selecciona un plan');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const mem = await membershipService.webRegisterMembership({
        planId: selectedPlanId,
      });
      setCreatedMembership(mem);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la membresía');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdMembership) {
    return (
      <div>
        <PageHeader title="Confirmación de Membresía" subtitle="Tu membresía ha sido registrada exitosamente" />
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={56} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                ¡Membresía Adquirida!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                Tu suscripción al plan ha sido confirmada.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>Plan Seleccionado:</span>
                <strong style={{ fontSize: '1rem', color: 'var(--color-neutral-900)' }}>{selectedPlan?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>Estado:</span>
                <StatusBadge status={createdMembership.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>Fecha de Inicio:</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--color-neutral-800)' }}>{formatDateForDisplay(createdMembership.startDate)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>Fecha de Vencimiento:</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--color-neutral-800)' }}>{formatDateForDisplay(createdMembership.endDate)}</strong>
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={() => navigate('/client')}>
              Ir al Inicio
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/client/plans" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver a Planes
        </Link>
      </div>

      <PageHeader title="Adquirir Membresía" subtitle="Selecciona un plan para inscribirte en el gimnasio" />

      <div style={{ maxWidth: '600px' }}>
        <Card title="Registro de Membresía">
          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <form onSubmit={handleConfirm}>
            <Select
              label="Seleccionar Plan de Membresía"
              options={plans.map((p) => ({
                value: p.id,
                label: `${p.name} - $${p.price} (${p.durationDays} días)`,
              }))}
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
            />

            {selectedPlan && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-neutral-50)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                  Resumen del Plan
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--color-neutral-600)' }}>Nombre del Plan:</span>
                  <strong>{selectedPlan.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--color-neutral-600)' }}>Duración:</span>
                  <span>{selectedPlan.durationDays} Días</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--color-neutral-600)' }}>Precio Total:</span>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>${selectedPlan.price}</strong>
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth isLoading={submitting}>
              Confirmar y Adquirir Membresía
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
