import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { planService, membershipService } from '../../api';
import { MembershipPlan } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Check, Calendar, AlertCircle } from 'lucide-react';

export const ClientPlansPage: React.FC = () => {
  const { client, user } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [hasActiveMembership, setHasActiveMembership] = useState<boolean>(false);
  const [activePlanName, setActivePlanName] = useState<string>('');

  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const activePlans = await planService.getActivePlans();
      setPlans(activePlans);

      const targetId = client?.id || user?.id;
      if (targetId) {
        try {
          const activeMem = await membershipService.getActiveClientMembership(targetId);
          if (activeMem && (activeMem.status === 'ACTIVE' || activeMem.status === 'PENDING')) {
            setHasActiveMembership(true);
            setActivePlanName(activeMem.planName || 'Plan Actual');
          }
        } catch {
          // ignore error check
        }
      }
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los planes de membresía');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [client, user]);

  if (loading) return <LoadingState message="Cargando planes de membresía disponibles..." />;
  if (error) return <ErrorState message={error} onRetry={fetchPlans} />;

  return (
    <div>
      <PageHeader
        title="Planes de Membresía"
        subtitle="Elige el plan que mejor se adapte a tu rutina de entrenamiento"
      />

      {hasActiveMembership && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: '#fffbe6',
            color: '#8c6b00',
            border: '1px solid #ffe58f',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Membresía Activa Detectada:</strong> Ya tienes una membresía activa (
            <strong>{activePlanName}</strong>). Puedes explorar los planes a continuación, pero no puedes inscribirte en un nuevo plan mientras tengas una membresía vigente.
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <EmptyState title="No hay planes disponibles" description="Actualmente no hay planes de membresía activos disponibles." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {plans.map((plan) => (
            <Card key={plan.id} className="plan-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    {plan.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      ${plan.price}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                      / {plan.durationDays} días
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: '1rem', flex: 1 }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-700)' }}>
                      <Check size={16} style={{ color: 'var(--color-success)' }} />
                      Acceso completo a instalaciones
                    </li>
                    <li style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-700)' }}>
                      <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
                      Duración: {plan.durationDays} Días
                    </li>
                    <li style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-700)' }}>
                      <Check size={16} style={{ color: 'var(--color-success)' }} />
                      Sin cargos ocultos
                    </li>
                  </ul>
                </div>

                <div style={{ paddingTop: '1rem' }}>
                  <Button
                    variant={hasActiveMembership ? 'secondary' : 'primary'}
                    fullWidth
                    disabled={hasActiveMembership}
                    onClick={() => !hasActiveMembership && navigate(`/client/membership?planId=${plan.id}`)}
                  >
                    {hasActiveMembership ? 'Membresía Activa' : 'Seleccionar Plan'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
