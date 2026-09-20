import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { KeyRound, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Extract cryptographic token from URL hash (#access_token=... or #token=...)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const extracted = hashParams.get('access_token') || hashParams.get('token');
      if (extracted) {
        setToken(extracted);
        return;
      }
    }

    // 2. Fallback check query params (?token=... or ?access_token=...)
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const extracted = searchParams.get('access_token') || searchParams.get('token');
      if (extracted) {
        setToken(extracted);
        return;
      }
    }

    // Token missing
    setToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Missing cryptographic authorization token.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await authService.updatePasswordWithToken(token, password);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Block access if token is missing
  if (token === null) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <AlertTriangle size={48} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-neutral-900)' }}>
            Invalid or Missing Reset Link
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            To reset your password, you must open the recovery link sent to your email. Accessing this page directly without an authentication token is prohibited.
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
            Return to Login Page
          </Button>
        </div>
      </div>
    );
  }

  if (successMsg) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <CheckCircle size={48} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-neutral-900)' }}>
            Password Reset Complete!
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginBottom: '1.5rem' }}>
            {successMsg}
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
            Log In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <KeyRound size={24} style={{ color: 'var(--color-primary)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Set New Password
        </h2>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>
        Enter your new secure password below to complete account recovery.
      </p>

      {errorMsg && (
        <div className="error-box" style={{ marginBottom: '1.25rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="New Password"
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" fullWidth isLoading={loading} style={{ marginTop: '0.5rem' }}>
          Update Password
        </Button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
};
