import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { planService } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const NewPlanPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [durationDays, setDurationDays] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || durationDays === '') {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (Number(price) <= 0) {
      setErrorMsg('El precio debe ser un valor mayor a cero.');
      return;
    }

    if (Number(durationDays) <= 0) {
      setErrorMsg('La duración debe ser al menos de 1 día.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await planService.createPlan({
        name,
        price: Number(price),
        durationDays: Number(durationDays),
      });
      navigate('/admin/plans');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear el plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/admin/plans" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver a Planes
        </Link>
      </div>

      <PageHeader title="Crear Plan de Membresía" subtitle="Añade una nueva oferta de membresía para los clientes" />

      <div style={{ maxWidth: '550px' }}>
        <Card title="Detalles del Plan">
          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Nombre del Plan"
              placeholder="Ej: Plan Mensual VIP"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Precio ($ USD)"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ej: 35.00"
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
              required
            />

            <Input
              label="Duración (en Días)"
              type="number"
              min="1"
              placeholder="Ej: 30"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value ? Number(e.target.value) : '')}
              required
            />

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/plans')}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Crear Plan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
