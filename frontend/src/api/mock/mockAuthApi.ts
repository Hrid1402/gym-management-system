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
      throw createApiError('Correo electrónico o contraseña inválidos', 401);
    }

    if (!user.isActive) {
      throw createApiError('La cuenta está inactiva. Por favor contacta al soporte.', 403);
    }

    const expectedPassword = store.passwords[user.email] || 'password123';
    if (password !== expectedPassword) {
      throw createApiError('Correo electrónico o contraseña inválidos', 401);
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
        message: 'Si existe una cuenta asociada a este correo, se han enviado las instrucciones de recuperación.',
      };
    }

    return {
      success: true,
      message: '¡Correo de recuperación enviado exitosamente! Revisa tu bandeja de entrada.',
    };
  }

  async registerClient(data: RegisterClientInput): Promise<AuthSession> {
    await delay();
    const store = getMockStore();
    const email = data.email.trim().toLowerCase();

    if (store.users.some((u) => u.email.toLowerCase() === email)) {
      throw createApiError('Ya existe una cuenta registrada con este correo electrónico', 400);
    }

    if (store.clients.some((c) => c.dni === data.dni.trim())) {
      throw createApiError('Ya existe un cliente registrado con este DNI', 400);
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

    const sessionRaw = localStorage.getItem(SESSION_KEY);
    let isStaffSession = false;
    if (sessionRaw) {
      try {
        const currentSession: AuthSession = JSON.parse(sessionRaw);
        if (currentSession.user && (currentSession.user.role === 'ADMIN' || currentSession.user.role === 'RECEPTIONIST')) {
          isStaffSession = true;
        }
      } catch {
        // ignore
      }
    }

    const session: AuthSession = { user: newUser, client: newClient };
    
    // Only update active session in localStorage if not registered by a logged-in staff member
    if (!isStaffSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return session;
  }

  async updateProfile(data: any): Promise<AuthSession> {
    await delay();
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!sessionRaw) throw createApiError('No autenticado', 401);

    const session: AuthSession = JSON.parse(sessionRaw);
    const store = getMockStore();

    const userIndex = store.users.findIndex((u) => u.id === session.user.id);
    if (userIndex !== -1) {
      if (data.name) store.users[userIndex].name = data.name;
      if (data.first_name && data.last_name) store.users[userIndex].name = `${data.first_name} ${data.last_name}`;
      if (data.email) store.users[userIndex].email = data.email;
    }

    if (session.client?.id) {
      const clientIndex = store.clients.findIndex((c) => c.id === session.client!.id);
      if (clientIndex !== -1) {
        if (data.first_name) store.clients[clientIndex].firstName = data.first_name;
        if (data.last_name) store.clients[clientIndex].lastName = data.last_name;
        if (data.phone) store.clients[clientIndex].phone = data.phone;
        if (data.address) store.clients[clientIndex].address = data.address;
        if (data.date_of_birth) store.clients[clientIndex].dateOfBirth = data.date_of_birth;
        if (data.dni) store.clients[clientIndex].dni = data.dni;
        if (data.email) store.clients[clientIndex].email = data.email;
      }
    }

    saveMockStore(store);
    return this.getCurrentUser() as Promise<AuthSession>;
  }

  async changePassword(password: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!sessionRaw) throw createApiError('No autenticado', 401);

    const session: AuthSession = JSON.parse(sessionRaw);
    const store = getMockStore();
    store.passwords[session.user.email] = password;
    saveMockStore(store);

    return { success: true, message: 'Contraseña cambiada exitosamente' };
  }

  async updatePasswordWithToken(_token: string, _password: string): Promise<{ success: boolean; message: string }> {
    await delay();
    return { success: true, message: 'Contraseña actualizada exitosamente. Por favor inicia sesión con tu nueva contraseña.' };
  }
}
