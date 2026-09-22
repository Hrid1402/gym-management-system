import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { APP_NAME } from '../config/appConfig';
import {
  Dumbbell,
  LayoutDashboard,
  UserCheck,
  Users,
  CreditCard,
  UserPlus,
  LogOut,
  User as UserIcon,
  Menu,
  X,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, client, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? 'sidebar-open' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Dumbbell size={24} style={{ color: 'var(--color-primary)' }} />
            <span className="sidebar-brand">{APP_NAME}</span>
          </div>
          <button
            className="mobile-toggle-btn"
            onClick={closeMobileMenu}
            style={{ color: '#ffffff' }}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {user.role === 'CLIENT' && (
            <>
              <NavLink
                to="/client"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={18} />
                <span>Inicio</span>
              </NavLink>
              <NavLink
                to="/client/profile"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <UserIcon size={18} />
                <span>Mi Perfil</span>
              </NavLink>
              <NavLink
                to="/client/plans"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <CreditCard size={18} />
                <span>Planes de Membresía</span>
              </NavLink>
              <NavLink
                to="/client/membership"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <UserCheck size={18} />
                <span>Adquirir Membresía</span>
              </NavLink>
            </>
          )}

          {user.role === 'RECEPTIONIST' && (
            <>
              <NavLink
                to="/reception"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={18} />
                <span>Inicio</span>
              </NavLink>
              <NavLink
                to="/reception/profile"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <UserIcon size={18} />
                <span>Mi Perfil</span>
              </NavLink>
              <NavLink
                to="/reception/clients"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Users size={18} />
                <span>Gestión de Clientes</span>
              </NavLink>
              <NavLink
                to="/reception/clients/new"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <UserPlus size={18} />
                <span>Registrar Cliente</span>
              </NavLink>
              <NavLink
                to="/reception/memberships/new"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <CreditCard size={18} />
                <span>Nueva Membresía</span>
              </NavLink>
            </>
          )}

          {user.role === 'ADMIN' && (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={18} />
                <span>Inicio</span>
              </NavLink>
              <NavLink
                to="/admin/profile"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <UserIcon size={18} />
                <span>Mi Perfil</span>
              </NavLink>
              <NavLink
                to="/admin/clients"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Users size={18} />
                <span>Clientes</span>
              </NavLink>
              <NavLink
                to="/admin/memberships"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <UserCheck size={18} />
                <span>Todas las Membresías</span>
              </NavLink>
              <NavLink
                to="/admin/plans"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <CreditCard size={18} />
                <span>Planes</span>
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <UserCheck size={18} />
                <span>Personal</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>Sesión:</span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--color-neutral-900)' }}>
                {client ? `${client.firstName} ${client.lastName}` : user.name}
              </strong>
              <StatusBadge role={user.role} />
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-neutral-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
