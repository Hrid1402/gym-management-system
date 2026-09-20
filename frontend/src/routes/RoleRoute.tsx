import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their role's default dashboard
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
  }

  return <Outlet />;
};
