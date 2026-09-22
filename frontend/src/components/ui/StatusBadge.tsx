import React from 'react';
import { MembershipStatus, UserRole } from '../../types';
import { ROLE_LABELS, MEMBERSHIP_STATUS_LABELS } from '../../config/appConfig';

interface StatusBadgeProps {
  status?: MembershipStatus | string;
  role?: UserRole;
  isActive?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, role, isActive }) => {
  if (isActive !== undefined) {
    return (
      <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    );
  }

  if (role) {
    const roleColors: Record<UserRole, string> = {
      ADMIN: 'badge-danger',
      RECEPTIONIST: 'badge-info',
      CLIENT: 'badge-active',
    };
    const roleLabel = ROLE_LABELS[role] || role;
    return <span className={`badge ${roleColors[role] || 'badge-info'}`}>{roleLabel}</span>;
  }

  if (status) {
    const statusClasses: Record<string, string> = {
      ACTIVE: 'badge-active',
      PENDING: 'badge-pending',
      EXPIRED: 'badge-expired',
      SUSPENDED: 'badge-warning',
      CANCELLED: 'badge-danger',
    };
    const statusLabel = MEMBERSHIP_STATUS_LABELS[status as MembershipStatus] || status;
    return <span className={`badge ${statusClasses[status] || 'badge-info'}`}>{statusLabel}</span>;
  }

  return null;
};
