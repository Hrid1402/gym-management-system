import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { validateEmail, validatePassword } from '../../utils/validators';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const errors = useMemo(() => {
    return {
      email: validateEmail(email),
      password: validatePassword(password),
    };
  }, [email, password]);

  const isValid = !errors.email && !errors.password;
  const isSubmitDisabled = !email || !password || !isValid || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Por favor verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-neutral-900)' }}>
        ¡Bienvenido de nuevo!
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>
        Ingresa a tu cuenta para acceder al sistema
      </p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="tu.correo@ejemplo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setTouched((prev) => ({ ...prev, email: true }));
          }}
          error={touched.email ? errors.email || undefined : undefined}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setTouched((prev) => ({ ...prev, password: true }));
          }}
          error={touched.password ? errors.password || undefined : undefined}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.875rem' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={loading} disabled={isSubmitDisabled}>
          Iniciar Sesión
        </Button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
        ¿No tienes una cuenta?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
};
