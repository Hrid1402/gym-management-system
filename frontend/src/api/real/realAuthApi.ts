import { IAuthApi } from '../authApi';
import { AuthSession, LoginCredentials, RegisterClientInput, User, Client } from '../../types';
import { apiClient } from '../apiClient';
import { getCookie, setCookie, deleteCookie, COOKIE_AUTH_TOKEN } from '../../utils/cookies';

export class RealAuthApi implements IAuthApi {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const res = await apiClient.post<{
      message: string;
      token: string;
      user: any;
    }>('auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    if (res.token) {
      setCookie(COOKIE_AUTH_TOKEN, res.token);
    }

    const rawUser = res.user;
    const isClient = rawUser.type === 'client';

    const user: User = {
      id: rawUser.id,
      name: isClient ? `${rawUser.first_name} ${rawUser.last_name}` : rawUser.name,
      email: credentials.email,
      role: isClient ? 'CLIENT' : rawUser.role,
      isActive: isClient ? true : rawUser.is_active,
      type: rawUser.type,
    };

    let client: Client | undefined = undefined;
    if (isClient) {
      client = {
        id: rawUser.id,
        dni: rawUser.dni || '',
        firstName: rawUser.first_name || '',
        lastName: rawUser.last_name || '',
        phone: rawUser.phone || '',
        email: credentials.email,
        isActive: true,
      };
    }

    return { token: res.token, user, client };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('auth/logout');
    } finally {
      deleteCookie(COOKIE_AUTH_TOKEN);
    }
  }

  async getCurrentUser(): Promise<AuthSession | null> {
    const token = getCookie(COOKIE_AUTH_TOKEN);
    if (!token) return null;

    try {
      const res = await apiClient.get<{ currentUser: any }>('auth/me');
      if (!res.currentUser) return null;

      const rawUser = res.currentUser;
      const isClient = rawUser.type === 'client';

      const user: User = {
        id: rawUser.id,
        name: isClient ? `${rawUser.first_name} ${rawUser.last_name}` : rawUser.name,
        email: rawUser.email,
        role: isClient ? 'CLIENT' : rawUser.role,
        isActive: isClient ? true : rawUser.is_active,
        type: rawUser.type,
      };

      let client: Client | undefined = undefined;
      if (isClient) {
        client = {
          id: rawUser.id,
          dni: rawUser.dni || '',
          firstName: rawUser.first_name || '',
          lastName: rawUser.last_name || '',
          phone: rawUser.phone || '',
          email: rawUser.email,
          isActive: true,
        };
      }

      return { token, user, client };
    } catch {
      deleteCookie(COOKIE_AUTH_TOKEN);
      return null;
    }
  }

  async recoverPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ message: string }>('auth/password-recovery', { email });
    return { success: true, message: res.message || 'Password recovery email sent successfully' };
  }

  async registerClient(data: RegisterClientInput): Promise<AuthSession> {
    await apiClient.post<{ message: string; client_id: string }>('auth/register', {
      email: data.email,
      password: data.password,
      dni: data.dni,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    });

    // Auto-login after registration
    return this.login({ email: data.email, password: data.password });
  }
}
