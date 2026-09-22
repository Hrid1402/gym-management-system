import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { planService } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ArrowLeft } from 'lucide-react';

export const EditPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [durationDays, setDurationDays] = useState<number | ''>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const plan = await planService.getPlan(id);
      setName(plan.name);
      setPrice(plan.price);
      setDurationDays(plan.durationDays);
      setIsActive(plan.isActive);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar el plan');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name.trim() || price === '' || durationDays === '') return;

    if (Number(price) <= 0) {
      setErrorMsg('El precio debe ser un valor mayor a cero.');
      return;
    }

    if (Number(durationDays) <= 0) {
      setErrorMsg('La duración debe ser al menos de 1 día.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await planService.updatePlan(id, {
        name,
        price: Number(price),
        durationDays: Number(durationDays),
      });
      await planService.updatePlanStatus(id, isActive);
      navigate('/admin/plans');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el plan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Cargando datos del plan..." />;
  if (errorMsg && !name) return <ErrorState message={errorMsg} onRetry={fetchPlan} />;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/admin/plans" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver a Planes
        </Link>
      </div>

      <PageHeader title="Editar Plan de Membresía" subtitle="Actualiza los detalles y el estado del plan" />

      <div style={{ maxWidth: '550px' }}>
        <Card title="Editar Plan">
          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Nombre del Plan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Precio ($ USD)"
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
              required
            />

            <Input
              label="Duración (en Días)"
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value ? Number(e.target.value) : '')}
              required
            />

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="isActivePlan"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="isActivePlan" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                Plan activo para selección de clientes
              </label>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/plans')}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
