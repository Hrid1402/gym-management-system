import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Dumbbell,
  LayoutDashboard,
  UserCheck,
  Users,
  CreditCard,
  UserPlus,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, client, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Dumbbell size={24} style={{ color: 'var(--color-primary)' }} />
          <span className="sidebar-brand">GymManager</span>
        </div>

        <nav className="sidebar-nav">
          {user.role === 'CLIENT' && (
            <>
              <NavLink to="/client" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/client/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserIcon size={18} />
                <span>My Profile</span>
              </NavLink>
              <NavLink to="/client/plans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CreditCard size={18} />
                <span>Membership Plans</span>
              </NavLink>
              <NavLink to="/client/membership" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserCheck size={18} />
                <span>Acquire Membership</span>
              </NavLink>
            </>
          )}

          {user.role === 'RECEPTIONIST' && (
            <>
              <NavLink to="/reception" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/reception/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserIcon size={18} />
                <span>My Profile</span>
              </NavLink>
              <NavLink to="/reception/clients" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>Clients</span>
              </NavLink>
              <NavLink to="/reception/clients/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserPlus size={18} />
                <span>Register Client</span>
              </NavLink>
              <NavLink to="/reception/memberships/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CreditCard size={18} />
                <span>New Membership</span>
              </NavLink>
            </>
          )}

          {user.role === 'ADMIN' && (
            <>
              <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/admin/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserIcon size={18} />
                <span>My Profile</span>
              </NavLink>
              <NavLink to="/admin/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>Clients</span>
              </NavLink>
              <NavLink to="/admin/memberships" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserCheck size={18} />
                <span>All Memberships</span>
              </NavLink>
              <NavLink to="/admin/plans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CreditCard size={18} />
                <span>Plans</span>
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserCheck size={18} />
                <span>Staff Users</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>Logged in as:</span>
            <strong style={{ fontSize: '0.875rem', color: 'var(--color-neutral-900)' }}>
              {client ? `${client.firstName} ${client.lastName}` : user.name}
            </strong>
            <StatusBadge role={user.role} />
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
            <span>Logout</span>
          </button>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
