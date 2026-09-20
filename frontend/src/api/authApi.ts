import { AuthSession, LoginCredentials, RegisterClientInput } from '../types';

export interface IAuthApi {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthSession | null>;
  recoverPassword(email: string): Promise<{ success: boolean; message: string }>;
  registerClient(data: RegisterClientInput): Promise<AuthSession>;
  updateProfile(data: any): Promise<AuthSession>;
  changePassword(password: string): Promise<{ success: boolean; message: string }>;
  updatePasswordWithToken(token: string, password: string): Promise<{ success: boolean; message: string }>;
}
