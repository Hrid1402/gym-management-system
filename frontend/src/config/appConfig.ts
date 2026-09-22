import { UserRole, MembershipStatus } from '../types';

/**
 * Global App Configuration
 * Change APP_NAME here to update the application title everywhere it appears in the UI.
 */
export const APP_NAME = 'StarkFit';
export const APP_TAGLINE = 'Sistema de Gestión de Gimnasio';
//export const APP_FOOTER_TEXT = `${APP_NAME} - Todos los derechos reservados`;
export const APP_FOOTER_TEXT = "";

/**
 * User-facing role labels in Spanish (Latin America)
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Gerente',
  RECEPTIONIST: 'Recepcionista',
  CLIENT: 'Cliente',
};

/**
 * User-facing status labels in Spanish (Latin America)
 */
export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  ACTIVE: 'Activa',
  PENDING: 'Pendiente',
  EXPIRED: 'Vencida',
  SUSPENDED: 'Suspendida',
  CANCELLED: 'Cancelada',
};

export const USER_STATUS_LABELS: Record<'active' | 'inactive', string> = {
  active: 'Activo',
  inactive: 'Inactivo',
};
