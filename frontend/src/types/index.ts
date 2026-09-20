export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'CLIENT';

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';

export interface User {
  id: string;
  supabaseUserId?: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  type?: 'client' | 'staff';
}

export interface ClientCurrentMembership {
  id: string;
  planName: string;
  price: number;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
}

export interface Client {
  id: string;
  supabaseUserId?: string;
  dni: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  photoPath?: string;
  isActive?: boolean;
  currentMembership?: ClientCurrentMembership | null;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  isActive: boolean;
}

export interface Membership {
  id: string;
  clientId: string;
  planId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: MembershipStatus;
  planName?: string;
  clientName?: string;
  price?: number;
  dni?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// DTOs & Request Inputs

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterClientInput {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
}

export interface CreateStaffClientInput {
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  accountPassword?: string;
  initialPlanId?: string;
  initialStartDate?: string;
}

export interface UpdateClientInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface CreatePlanInput {
  name: string;
  price: number;
  durationDays: number;
}

export interface UpdatePlanInput {
  name?: string;
  price?: number;
  durationDays?: number;
}

export interface StaffRegisterMembershipInput {
  clientId: string;
  planId: string;
  startDate: string;
}

export interface WebRegisterMembershipInput {
  planId: string;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateStaffInput {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface AuthSession {
  token?: string;
  user: User;
  client?: Client;
}
