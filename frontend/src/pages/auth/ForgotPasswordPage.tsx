import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { recoverPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await recoverPassword(email);
      setMessage(result.message);
    } catch {
      setMessage('Password recovery request processed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-neutral-900)' }}>
        Reset Password
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>
        Enter your registered email address to receive password recovery instructions.
      </p>

      {message && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" fullWidth isLoading={loading} style={{ marginTop: '0.5rem' }}>
          Send Recovery Link
        </Button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <Link to="/login" style={{ fontWeight: 500 }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};
