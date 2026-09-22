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
      setErrorMsg('Falta el token de autorización de recuperación.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await authService.updatePasswordWithToken(token, password);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar la contraseña. El enlace puede haber expirado.');
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
            Enlace Inválido o Ausente
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Para restablecer tu contraseña, debes abrir el enlace de recuperación enviado a tu correo electrónico. No se permite acceder a esta página sin un token válido.
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
            Volver al Inicio de Sesión
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
            ¡Contraseña Restablecida Con Éxito!
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginBottom: '1.5rem' }}>
            {successMsg}
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
            Iniciar Sesión Ahora
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
          Nueva Contraseña
        </h2>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>
        Ingresa tu nueva contraseña a continuación para completar la recuperación de tu cuenta.
      </p>

      {errorMsg && (
        <div className="error-box" style={{ marginBottom: '1.25rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Nueva Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirmar Nueva Contraseña"
          type="password"
          placeholder="Vuelve a ingresar la contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" fullWidth isLoading={loading} style={{ marginTop: '0.5rem' }}>
          Actualizar Contraseña
        </Button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
};
