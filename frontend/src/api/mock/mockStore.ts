import { User, Client, MembershipPlan, Membership, MembershipStatus, ApiError } from '../../types';

export type MockStore = {
  users: User[];
  clients: Client[];
  plans: MembershipPlan[];
  memberships: Membership[];
  // Mock passwords mapped by email for fake authentication
  passwords: Record<string, string>;
};

const STORAGE_KEY = 'gym_mock_store';
export const SESSION_KEY = 'gym_mock_session';

export const delay = (ms = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_SEED_DATA: MockStore = {
  users: [
    {
      id: 'usr-admin-1',
      supabaseUserId: 'supa-admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      isActive: true,
    },
    {
      id: 'usr-reception-1',
      supabaseUserId: 'supa-reception-1',
      name: 'Receptionist User',
      email: 'reception@example.com',
      role: 'RECEPTIONIST',
      isActive: true,
    },
    {
      id: 'usr-client-1',
      supabaseUserId: 'supa-client-1',
      name: 'Carlos Gomez',
      email: 'client@example.com',
      role: 'CLIENT',
      isActive: true,
    },
  ],
  clients: [
    {
      id: 'client-1',
      supabaseUserId: 'supa-client-1',
      dni: '12345678A',
      firstName: 'Carlos',
      lastName: 'Gomez',
      phone: '+1 555-0192',
      email: 'client@example.com',
      dateOfBirth: '1992-05-15',
      address: '123 Main St, Cityville',
      isActive: true,
    },
    {
      id: 'client-2',
      supabaseUserId: 'supa-client-2',
      dni: '87654321B',
      firstName: 'Ana',
      lastName: 'Martinez',
      phone: '+1 555-0193',
      email: 'ana@example.com',
      dateOfBirth: '1995-08-20',
      address: '456 Oak Ave, Townsville',
      isActive: true,
    },
    {
      id: 'client-3',
      supabaseUserId: 'supa-client-3',
      dni: '45678912C',
      firstName: 'Luis',
      lastName: 'Rodriguez',
      phone: '+1 555-0194',
      email: 'luis@example.com',
      dateOfBirth: '1988-11-03',
      address: '789 Pine Rd, Metrocity',
      isActive: true,
    },
  ],
  plans: [
    {
      id: 'plan-1',
      name: 'Monthly Plan',
      price: 30,
      durationDays: 30,
      isActive: true,
    },
    {
      id: 'plan-2',
      name: 'Quarterly Plan',
      price: 80,
      durationDays: 90,
      isActive: true,
    },
    {
      id: 'plan-3',
      name: 'Annual Plan',
      price: 250,
      durationDays: 365,
      isActive: true,
    },
  ],
  memberships: [
    {
      id: 'mem-1',
      clientId: 'client-1',
      planId: 'plan-1',
      startDate: '2026-09-01',
      endDate: '2026-10-01',
      status: 'ACTIVE',
    },
    {
      id: 'mem-2',
      clientId: 'client-2',
      planId: 'plan-2',
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      status: 'ACTIVE',
    },
  ],
  passwords: {
    'admin@example.com': 'admin123',
    'reception@example.com': 'reception123',
    'client@example.com': 'client123',
    'ana@example.com': 'ana123',
    'luis@example.com': 'luis123',
  },
};

export const getMockStore = (): MockStore => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    saveMockStore(INITIAL_SEED_DATA);
    return INITIAL_SEED_DATA;
  }
  try {
    return JSON.parse(data);
  } catch {
    saveMockStore(INITIAL_SEED_DATA);
    return INITIAL_SEED_DATA;
  }
};

export const saveMockStore = (store: MockStore): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const resetMockStore = (): MockStore => {
  saveMockStore(INITIAL_SEED_DATA);
  return INITIAL_SEED_DATA;
};

// Date calculation helpers

export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateEndDate = (startDateStr: string, durationDays: number): string => {
  const parts = startDateStr.split('-');
  const start = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  start.setDate(start.getDate() + durationDays);
  
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateMembershipStatus = (
  startDate: string,
  endDate: string,
  currentStatus?: MembershipStatus
): MembershipStatus => {
  // Preserve administrative overrides if already set to SUSPENDED or CANCELLED
  if (currentStatus === 'SUSPENDED' || currentStatus === 'CANCELLED') {
    return currentStatus;
  }

  const today = getTodayString();

  if (startDate > today) {
    return 'PENDING';
  }
  if (startDate <= today && endDate >= today) {
    return 'ACTIVE';
  }
  return 'EXPIRED';
};

export const createApiError = (message: string, status = 400, code?: string): ApiError => {
  return { message, status, code };
};
