import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, planService, membershipService } from '../../api';
import { MembershipPlan } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { getTodayString } from '../../api/mock/mockStore';

export const NewClientPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    accountPassword: '',
  });

  const [hasInitialMembership, setHasInitialMembership] = useState<boolean>(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [initialPlanId, setInitialPlanId] = useState<string>('');
  const [initialStartDate, setInitialStartDate] = useState<string>(getTodayString());

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivePlans = async () => {
      try {
        const activePlans = await planService.getActivePlans();
        setPlans(activePlans);
        if (activePlans.length > 0) {
          setInitialPlanId(activePlans[0].id);
        }
      } catch (err) {
        console.error('Error al obtener planes:', err);
      }
    };
    fetchActivePlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.dni || !formData.phone || !formData.email) {
      setErrorMsg('Por favor completa todos los datos requeridos del cliente.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Register Client Account (POST /api/auth/register)
      const session = await authService.registerClient({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dni: formData.dni,
        email: formData.email,
        password: formData.accountPassword || 'temp1234',
        phone: formData.phone,
      });

      const newClientId = session.client?.id || session.user.id;

      // 2. If staff also selected an initial membership plan, register it for the new client
      if (hasInitialMembership && initialPlanId && newClientId) {
        try {
          await membershipService.staffRegisterMembership({
            clientId: newClientId,
            planId: initialPlanId,
            startDate: initialStartDate,
          });
        } catch (memErr: any) {
          console.error('Cliente registrado pero falló la membresía:', memErr);
        }
      }

      navigate(`/reception/clients/${newClientId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la cuenta del cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Registrar Cuenta de Cliente"
        subtitle="Flujo de recepción para registrar cliente y membresía inicial opcional"
      />

      <div style={{ maxWidth: '650px' }}>
        <Card title="Registro de Cuenta de Cliente">
          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              1. Datos Personales y de Contacto
            </h4>

            <div className="form-grid-2">
              <Input
                label="Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="DNI / Documento de Identidad"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
            />

            <Input
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Contraseña Inicial de Cuenta"
              name="accountPassword"
              type="text"
              placeholder="Por defecto 'temp1234' si se deja en blanco"
              value={formData.accountPassword}
              onChange={handleChange}
              helperText="El cliente podrá usar esta contraseña para iniciar sesión"
            />

            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--color-neutral-200)' }} />

            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              2. Membresía Inicial (Opcional)
            </h4>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="hasMembership"
                checked={hasInitialMembership}
                onChange={(e) => setHasInitialMembership(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="hasMembership" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                Asignar un plan de membresía inicial ahora
              </label>
            </div>

            {hasInitialMembership && (
              <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <Select
                  label="Seleccionar Plan de Membresía"
                  options={plans.map((p) => ({
                    value: p.id,
                    label: `${p.name} - $${p.price} (${p.durationDays} días)`,
                  }))}
                  value={initialPlanId}
                  onChange={(e) => setInitialPlanId(e.target.value)}
                  required={hasInitialMembership}
                />

                <Input
                  label="Fecha de Inicio"
                  type="date"
                  value={initialStartDate}
                  onChange={(e) => setInitialStartDate(e.target.value)}
                  required={hasInitialMembership}
                />
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" fullWidth isLoading={loading}>
                Registrar Cuenta de Cliente
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
