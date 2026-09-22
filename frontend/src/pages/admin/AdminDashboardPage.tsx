import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientService, membershipService, planService, userService } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { Users, UserCheck, CreditCard, Shield, PlusCircle } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    clientsCount: 0,
    activeMembershipsCount: 0,
    plansCount: 0,
    usersCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const [cList, mList, pList, uList] = await Promise.all([
          clientService.getClients().catch(() => []),
          membershipService.getMemberships().catch(() => []),
          planService.getPlans().catch(() => []),
          userService.getUsers().catch(() => []),
        ]);
        setStats({
          clientsCount: cList.length,
          activeMembershipsCount: mList.filter((m) => m.status === 'ACTIVE').length,
          plansCount: pList.length,
          usersCount: uList.length,
        });
      } catch (err) {
        console.error('Error al cargar estadísticas de gerencia:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <LoadingState message="Cargando métricas de gerencia..." />;

  return (
    <div>
      <PageHeader
        title="Panel de Gerencia"
        subtitle="Vista general de métricas del sistema, planes, personal y membresías"
        action={
          <Link to="/admin/plans/new">
            <Button variant="primary" icon={<PlusCircle size={16} />}>
              Crear Plan
            </Button>
          </Link>
        }
      />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.clientsCount}</div>
            <div className="stat-label">Total de Clientes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.activeMembershipsCount}</div>
            <div className="stat-label">Membresías Activas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.plansCount}</div>
            <div className="stat-label">Planes Configurados</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-text)' }}>
            <Shield size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.usersCount}</div>
            <div className="stat-label">Personal Activo</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card title="Gestión Rápida del Sistema">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/admin/plans">
              <Button variant="secondary" fullWidth style={{ justifyContent: 'flex-start' }}>
                <CreditCard size={18} /> Gestionar Planes de Membresía
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="secondary" fullWidth style={{ justifyContent: 'flex-start' }}>
                <Shield size={18} /> Gestionar Usuarios de Personal
              </Button>
            </Link>
            <Link to="/admin/memberships">
              <Button variant="secondary" fullWidth style={{ justifyContent: 'flex-start' }}>
                <UserCheck size={18} /> Ver Todas las Membresías
              </Button>
            </Link>
            <Link to="/admin/clients">
              <Button variant="secondary" fullWidth style={{ justifyContent: 'flex-start' }}>
                <Users size={18} /> Ver Directorio de Clientes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
