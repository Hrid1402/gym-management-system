import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clientService, planService, membershipService } from '../../api';
import { Client, MembershipPlan, Membership } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { getTodayString } from '../../api/mock/mockStore';
import { CheckCircle2 } from 'lucide-react';
import { formatDateForDisplay } from '../../utils/dateUtils';

export const NewMembershipPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(getTodayString());

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdMembership, setCreatedMembership] = useState<Membership | null>(null);

  const preselectedClientId = searchParams.get('clientId');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allClients, activePlans] = await Promise.all([
        clientService.getClients(),
        planService.getActivePlans(),
      ]);

      setClients(allClients);
      setPlans(activePlans);

      if (preselectedClientId && allClients.some((c) => c.id === preselectedClientId)) {
        setSelectedClientId(preselectedClientId);
      } else if (allClients.length > 0) {
        setSelectedClientId(allClients[0].id);
      }

      if (activePlans.length > 0) {
        setSelectedPlanId(activePlans[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar opciones');
    } finally {
      setLoading(false);
    }
  }, [preselectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isValid = useMemo(() => {
    return Boolean(selectedClientId && selectedPlanId && startDate);
  }, [selectedClientId, selectedPlanId, startDate]);

  if (loading) return <LoadingState message="Cargando formulario de registro de membresía..." />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setErrorMsg('Por favor completa todos los campos obligatorios del formulario.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const mem = await membershipService.staffRegisterMembership({
        clientId: selectedClientId,
        planId: selectedPlanId,
        startDate,
      });
      setCreatedMembership(mem);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la membresía para el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  if (createdMembership) {
    return (
      <div>
        <PageHeader title="Membresía Creada" subtitle="Registro de membresía por personal completado" />
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={56} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                ¡Membresía Registrada Exitosamente!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                Membresía dada de alta para {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'el cliente'}
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Cliente:</span>
                <strong>{selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : selectedClientId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Plan:</span>
                <strong>{selectedPlan?.name || createdMembership.planName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Estado:</span>
                <StatusBadge status={createdMembership.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Fecha de Inicio:</span>
                <strong>{formatDateForDisplay(createdMembership.startDate)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Fecha de Vencimiento:</span>
                <strong>{formatDateForDisplay(createdMembership.endDate)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button variant="secondary" fullWidth onClick={() => navigate('/reception/clients')}>
                Directorio de Clientes
              </Button>
              <Button variant="primary" fullWidth onClick={() => navigate(`/reception/clients/${selectedClientId}`)}>
                Ver Detalles del Cliente
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Alta de Membresía"
        subtitle="Registra a un cliente existente en un plan de membresía seleccionado"
      />

      <div style={{ maxWidth: '600px' }}>
        <Card title="Formulario de Membresía">
          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <Select
              label="Seleccionar Cliente Existente"
              options={clients.map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName} (DNI: ${c.dni})`,
              }))}
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
            />

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

            <Input
              label="Fecha de Inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" fullWidth isLoading={submitting} disabled={!isValid || submitting}>
                Registrar Membresía para Cliente
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
