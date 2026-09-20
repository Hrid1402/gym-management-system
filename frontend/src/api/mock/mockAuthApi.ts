import { IAuthApi } from '../authApi';
import { AuthSession, LoginCredentials, RegisterClientInput } from '../../types';
import {
  getMockStore,
  saveMockStore,
  SESSION_KEY,
  delay,
  createApiError,
} from './mockStore';

export class MockAuthApi implements IAuthApi {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay();
    const store = getMockStore();
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    const user = store.users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      throw createApiError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw createApiError('Account is inactive. Please contact support.', 403);
    }

    const expectedPassword = store.passwords[user.email] || 'password123';
    if (password !== expectedPassword) {
      throw createApiError('Invalid email or password', 401);
    }

    let client = undefined;
    if (user.role === 'CLIENT') {
      client = store.clients.find((c) => c.supabaseUserId === user.supabaseUserId);
    }

    const session: AuthSession = { user, client };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  }

  async logout(): Promise<void> {
    await delay(150);
    localStorage.removeItem(SESSION_KEY);
  }

  async getCurrentUser(): Promise<AuthSession | null> {
    await delay(100);
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!sessionRaw) return null;

    try {
      const session: AuthSession = JSON.parse(sessionRaw);
      const store = getMockStore();
      
      const freshUser = store.users.find((u) => u.id === session.user.id);
      if (!freshUser || !freshUser.isActive) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      let freshClient = undefined;
      if (freshUser.role === 'CLIENT') {
        freshClient = store.clients.find((c) => c.supabaseUserId === freshUser.supabaseUserId);
      }

      return { user: freshUser, client: freshClient };
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  async recoverPassword(email: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const store = getMockStore();
    const trimmedEmail = email.trim().toLowerCase();

    const user = store.users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      // For security, don't reveal if user exists, return standard success text
      return {
        success: true,
        message: 'If an account exists with this email, recovery instructions have been sent.',
      };
    }

    return {
      success: true,
      message: 'Password recovery email sent successfully! Check your inbox for instructions.',
    };
  }

  async registerClient(data: RegisterClientInput): Promise<AuthSession> {
    await delay();
    const store = getMockStore();
    const email = data.email.trim().toLowerCase();

    if (store.users.some((u) => u.email.toLowerCase() === email)) {
      throw createApiError('An account with this email already exists', 400);
    }

    if (store.clients.some((c) => c.dni === data.dni.trim())) {
      throw createApiError('A client with this DNI already exists', 400);
    }

    const timestamp = Date.now();
    const supabaseUserId = `supa-client-${timestamp}`;

    const newUser = {
      id: `usr-client-${timestamp}`,
      supabaseUserId,
      name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      email,
      role: 'CLIENT' as const,
      isActive: true,
    };

    const newClient = {
      id: `client-${timestamp}`,
      supabaseUserId,
      dni: data.dni.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      email,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      isActive: true,
    };

    store.users.push(newUser);
    store.clients.push(newClient);
    store.passwords[email] = data.password;

    saveMockStore(store);

    const session: AuthSession = { user: newUser, client: newClient };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  }
}
