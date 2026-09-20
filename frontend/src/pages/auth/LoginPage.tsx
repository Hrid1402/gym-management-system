import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-neutral-900)' }}>
        Welcome Back
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>
        Log in to access your dashboard
      </p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.875rem' }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={loading}>
          Log In
        </Button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>
          Register here
        </Link>
      </div>
    </div>
  );
};
