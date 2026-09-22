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
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await registerClient(formData);
      navigate('/client');
    } catch (err: any) {
      setError(err.message || 'Error en el registro. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-neutral-900)' }}>
        Crear Cuenta de Cliente
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>
        Regístrate como nuevo miembro del gimnasio
      </p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <Input
            label="Nombre"
            name="firstName"
            placeholder="Juan"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            label="Apellido"
            name="lastName"
            placeholder="Pérez"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="DNI / Documento de Identidad"
          name="dni"
          placeholder="Ej: 12345678A"
          value={formData.dni}
          onChange={handleChange}
          required
        />

        <Input
          label="Teléfono"
          name="phone"
          type="tel"
          placeholder="+54 9 11 1234-5678"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <Input
          label="Correo Electrónico"
          name="email"
          type="email"
          placeholder="juan.perez@ejemplo.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Contraseña"
          name="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Input
          label="Fecha de Nacimiento (Opcional)"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />

        <Input
          label="Dirección (Opcional)"
          name="address"
          placeholder="Av. Principal 123"
          value={formData.address}
          onChange={handleChange}
        />

        <div style={{ marginTop: '1.5rem' }}>
          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Crear Cuenta e Iniciar Sesión
          </Button>
        </div>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" style={{ fontWeight: 600 }}>
          Inicia sesión
        </Link>
      </div>
    </div>
  );
};
