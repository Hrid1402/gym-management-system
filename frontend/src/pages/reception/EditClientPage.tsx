import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientService } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ArrowLeft } from 'lucide-react';
import { formatDateForInput } from '../../utils/dateUtils';

export const EditClientPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    address: '',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const client = await clientService.getClient(id);
      setFormData({
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        dni: client.dni || '',
        phone: client.phone || '',
        email: client.email || '',
        dateOfBirth: formatDateForInput(client.dateOfBirth),
        address: client.address || '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar los datos del cliente');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await clientService.updateClient(id, {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formatDateForInput(formData.dateOfBirth) : '',
      });
      navigate(`/reception/clients/${id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el cliente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Cargando datos del cliente..." />;
  if (errorMsg && !formData.firstName) return <ErrorState message={errorMsg} onRetry={fetchClient} />;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/reception/clients/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver a Detalles
        </Link>
      </div>

      <PageHeader title="Editar Perfil de Cliente" subtitle="Actualiza la información de contacto personal del cliente" />

      <div style={{ maxWidth: '650px' }}>
        <Card title="Editar Información del Cliente">
          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <Input
                label="Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="DNI / Documento de Identidad"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
            />

            <Input
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              label="Fecha de Nacimiento"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            <Input
              label="Dirección"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="secondary" onClick={() => navigate(`/reception/clients/${id}`)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
