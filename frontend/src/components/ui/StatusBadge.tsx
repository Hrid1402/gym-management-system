import React from 'react';
import { MembershipStatus, UserRole } from '../../types';

interface StatusBadgeProps {
  status?: MembershipStatus | string;
  role?: UserRole;
  isActive?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, role, isActive }) => {
  if (isActive !== undefined) {
    return (
      <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  }

  if (role) {
    const roleColors: Record<UserRole, string> = {
      ADMIN: 'badge-danger',
      RECEPTIONIST: 'badge-info',
      CLIENT: 'badge-active',
    };
    return <span className={`badge ${roleColors[role] || 'badge-info'}`}>{role}</span>;
  }

  if (status) {
    const statusClasses: Record<string, string> = {
      ACTIVE: 'badge-active',
      PENDING: 'badge-pending',
      EXPIRED: 'badge-expired',
      SUSPENDED: 'badge-warning',
      CANCELLED: 'badge-danger',
    };
    return <span className={`badge ${statusClasses[status] || 'badge-info'}`}>{status}</span>;
  }

  return null;
};
