import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { registerClient } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.dni || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await registerClient(formData);
      navigate('/client');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-neutral-900)' }}>
        Create Client Account
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>
        Register as a new gym member
      </p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="First Name"
            name="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="DNI / Identification"
          name="dni"
          placeholder="e.g. 12345678X"
          value={formData.dni}
          onChange={handleChange}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+1 555-0100"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Input
          label="Date of Birth (Optional)"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />

        <Input
          label="Address (Optional)"
          name="address"
          placeholder="123 Main St"
          value={formData.address}
          onChange={handleChange}
        />

        <div style={{ marginTop: '1.5rem' }}>
          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Create Account & Log In
          </Button>
        </div>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 600 }}>
          Log in
        </Link>
      </div>
    </div>
  );
};
