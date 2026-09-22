import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientService, membershipService } from '../../api';
import { Client } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Edit, CreditCard, Trash2, ArrowLeft, Calendar, Phone, Mail, MapPin, FileText, Ban } from 'lucide-react';
import { formatDateForDisplay } from '../../utils/dateUtils';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [cancellingMem, setCancellingMem] = useState<boolean>(false);

  const fetchClientDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const c = await clientService.getClient(id);
      setClient(c);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los detalles del cliente');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientDetails();
  }, [fetchClientDetails]);

  const handleDeleteClient = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await clientService.deleteClient(id);
      setIsDeleteModalOpen(false);
      navigate('/reception/clients');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el cliente');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!client?.currentMembership) return;
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta membresía?')) return;

    setCancellingMem(true);
    try {
      await membershipService.cancelMembership(client.currentMembership.id);
      await fetchClientDetails();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar la membresía');
    } finally {
      setCancellingMem(false);
    }
  };

  if (loading) return <LoadingState message="Cargando detalles del cliente..." />;
  if (error || !client) return <ErrorState message={error || 'Cliente no encontrado'} onRetry={fetchClientDetails} />;

  const currentMem = client.currentMembership;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/reception/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver al Directorio
        </Link>
      </div>

      <PageHeader
        title={`${client.firstName} ${client.lastName}`}
        subtitle={`ID de Cliente: ${client.id}`}
        action={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit size={16} />}
              onClick={() => navigate(`/reception/clients/${client.id}/edit`)}
            >
              Editar Cliente
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<CreditCard size={16} />}
              onClick={() => navigate(`/reception/memberships/new?clientId=${client.id}`)}
            >
              Registrar Membresía
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Eliminar Cliente
            </Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Client Profile Info Card */}
        <Card title="Detalles del Perfil del Cliente">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <FileText size={18} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ color: 'var(--color-neutral-500)' }}>DNI:</span>
              <strong>{client.dni}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Phone size={18} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ color: 'var(--color-neutral-500)' }}>Teléfono:</span>
              <strong>{client.phone}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Mail size={18} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ color: 'var(--color-neutral-500)' }}>Correo:</span>
              <strong>{client.email || '—'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Calendar size={18} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ color: 'var(--color-neutral-500)' }}>Fecha de Nacimiento:</span>
              <strong>{formatDateForDisplay(client.dateOfBirth)}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <MapPin size={18} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ color: 'var(--color-neutral-500)' }}>Dirección:</span>
              <strong>{client.address || '—'}</strong>
            </div>
          </div>
        </Card>

        {/* Current Membership Card */}
        <Card title="Membresía Activa Actual">
          {currentMem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  {currentMem.planName}
                </h4>
                <StatusBadge status={currentMem.status} />
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                Precio: ${currentMem.price}
              </p>

              <div className="form-grid-2" style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-200)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Fecha de Inicio</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatDateForDisplay(currentMem.startDate)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Fecha de Vencimiento</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatDateForDisplay(currentMem.endDate)}</div>
                </div>
              </div>

              {(currentMem.status === 'ACTIVE' || currentMem.status === 'PENDING') && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    icon={<Ban size={14} />}
                    isLoading={cancellingMem}
                    onClick={handleCancelMembership}
                  >
                    Cancelar Membresía
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '1rem' }}>
                Este cliente no posee una membresía activa o pendiente.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<CreditCard size={14} />}
                onClick={() => navigate(`/reception/memberships/new?clientId=${client.id}`)}
              >
                Registrar Membresía
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación Permanente"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" isLoading={deleting} onClick={handleDeleteClient}>
              Eliminar Cliente Definitivamente
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-700)' }}>
          ¿Estás seguro de que deseas eliminar permanentemente al cliente <strong>{client.firstName} {client.lastName}</strong>?
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-danger-text)', marginTop: '0.5rem', fontWeight: 600 }}>
          Advertencia: Esta acción eliminará definitivamente el registro del cliente de la base de datos.
        </p>
      </Modal>
    </div>
  );
};
