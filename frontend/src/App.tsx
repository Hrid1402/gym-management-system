import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { ClientProfilePage } from './pages/client/ClientProfilePage';
import { ClientPlansPage } from './pages/client/ClientPlansPage';
import { ClientMembershipPage } from './pages/client/ClientMembershipPage';

import { ReceptionDashboardPage } from './pages/reception/ReceptionDashboardPage';
import { ReceptionClientsPage } from './pages/reception/ReceptionClientsPage';
import { NewClientPage } from './pages/reception/NewClientPage';
import { ClientDetailPage } from './pages/reception/ClientDetailPage';
import { EditClientPage } from './pages/reception/EditClientPage';
import { NewMembershipPage } from './pages/reception/NewMembershipPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminClientsPage } from './pages/admin/AdminClientsPage';
import { AdminMembershipsPage } from './pages/admin/AdminMembershipsPage';
import { AdminPlansPage } from './pages/admin/AdminPlansPage';
import { NewPlanPage } from './pages/admin/NewPlanPage';
import { EditPlanPage } from './pages/admin/EditPlanPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

import { NotFoundPage } from './pages/NotFoundPage';
import { LoadingState } from './components/ui/LoadingState';

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingState message="Loading Gym Management System..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'RECEPTIONIST':
      return <Navigate to="/reception" replace />;
    case 'CLIENT':
      return <Navigate to="/client" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root Redirect based on Auth State & Role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Client Routes */}
              <Route element={<RoleRoute allowedRoles={['CLIENT']} />}>
                <Route path="/client" element={<ClientDashboardPage />} />
                <Route path="/client/profile" element={<ClientProfilePage />} />
                <Route path="/client/plans" element={<ClientPlansPage />} />
                <Route path="/client/membership" element={<ClientMembershipPage />} />
              </Route>

              {/* Receptionist Routes */}
              <Route element={<RoleRoute allowedRoles={['RECEPTIONIST']} />}>
                <Route path="/reception" element={<ReceptionDashboardPage />} />
                <Route path="/reception/clients" element={<ReceptionClientsPage />} />
                <Route path="/reception/clients/new" element={<NewClientPage />} />
                <Route path="/reception/clients/:id" element={<ClientDetailPage />} />
                <Route path="/reception/clients/:id/edit" element={<EditClientPage />} />
                <Route path="/reception/memberships/new" element={<NewMembershipPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/clients" element={<AdminClientsPage />} />
                <Route path="/admin/memberships" element={<AdminMembershipsPage />} />
                <Route path="/admin/plans" element={<AdminPlansPage />} />
                <Route path="/admin/plans/new" element={<NewPlanPage />} />
                <Route path="/admin/plans/:id/edit" element={<EditPlanPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
