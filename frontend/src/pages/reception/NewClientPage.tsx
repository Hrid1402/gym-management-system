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
        console.error('Error fetching plans:', err);
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
      setErrorMsg('Please fill in all required client details.');
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
          console.error('Client registered, but membership failed:', memErr);
        }
      }

      navigate(`/reception/clients/${newClientId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register client account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Register New Client Account"
        subtitle="Staff workflow to register a client account and optional initial membership"
      />

      <div style={{ maxWidth: '650px' }}>
        <Card title="Client Account Registration">
          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              1. Personal & Contact Details
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="DNI / Identification"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="Account Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Initial Account Password"
              name="accountPassword"
              type="text"
              placeholder="Defaults to 'temp1234' if blank"
              value={formData.accountPassword}
              onChange={handleChange}
              helperText="Client can use this password to log in"
            />

            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--color-neutral-200)' }} />

            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              2. Initial Membership (Optional)
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
                Register an initial membership plan now
              </label>
            </div>

            {hasInitialMembership && (
              <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <Select
                  label="Select Membership Plan"
                  options={plans.map((p) => ({
                    value: p.id,
                    label: `${p.name} - $${p.price} (${p.durationDays} days)`,
                  }))}
                  value={initialPlanId}
                  onChange={(e) => setInitialPlanId(e.target.value)}
                  required={hasInitialMembership}
                />

                <Input
                  label="Start Date"
                  type="date"
                  value={initialStartDate}
                  onChange={(e) => setInitialStartDate(e.target.value)}
                  required={hasInitialMembership}
                />
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" fullWidth isLoading={loading}>
                Register Client Account
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
