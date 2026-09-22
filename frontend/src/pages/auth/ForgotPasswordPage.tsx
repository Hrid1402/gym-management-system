import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { validateEmail } from '../../utils/validators';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { recoverPassword } = useAuth();

  const emailError = useMemo(() => validateEmail(email), [email]);
  const isValid = !emailError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await recoverPassword(email);
      setMessage(result.message);
    } catch {
      setMessage('Si existe una cuenta asociada a este correo, se han enviado las instrucciones de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-neutral-900)' }}>
        Recuperar Contraseña
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>
        Ingresa tu correo electrónico registrado para recibir las instrucciones de recuperación.
      </p>

      {message && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="tu.correo@ejemplo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setTouched(true);
          }}
          error={touched ? emailError || undefined : undefined}
          required
        />

        <Button type="submit" variant="primary" fullWidth isLoading={loading} disabled={!isValid || loading} style={{ marginTop: '0.5rem' }}>
          Enviar Enlace de Recuperación
        </Button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <Link to="/login" style={{ fontWeight: 500 }}>
          Volver a Iniciar Sesión
        </Link>
      </div>
    </div>
  );
};
