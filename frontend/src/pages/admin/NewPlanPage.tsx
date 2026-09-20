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
    if (!name || price === '' || durationDays === '') {
      setErrorMsg('Please fill in all fields');
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
      setErrorMsg(err.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/admin/plans" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Plans
        </Link>
      </div>

      <PageHeader title="Create Membership Plan" subtitle="Add a new membership offer for gym clients" />

      <div style={{ maxWidth: '550px' }}>
        <Card title="Plan Details">
          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Plan Name"
              placeholder="e.g. Monthly VIP Pass"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Price ($ USD)"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 35.00"
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
              required
            />

            <Input
              label="Duration (in Days)"
              type="number"
              min="1"
              placeholder="e.g. 30"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value ? Number(e.target.value) : '')}
              required
            />

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/plans')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Create Plan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
