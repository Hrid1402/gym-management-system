import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Client, LoginCredentials, RegisterClientInput } from '../types';
import { authService, clientService } from '../api';
import { getCookie, deleteCookie, COOKIE_AUTH_TOKEN } from '../utils/cookies';

interface AuthContextType {
  token: string | null;
  user: User | null;
  client: Client | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  registerClient: (data: RegisterClientInput) => Promise<void>;
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getCookie(COOKIE_AUTH_TOKEN));
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    const existingToken = getCookie(COOKIE_AUTH_TOKEN);
    if (!existingToken) {
      setUser(null);
      setClient(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const session = await authService.getCurrentUser();
      if (session) {
        setUser(session.user);
        setToken(session.token || getCookie(COOKIE_AUTH_TOKEN));
        if (session.client) {
          setClient(session.client);
        } else {
          setClient(null);
        }
      } else {
        setUser(null);
        setClient(null);
        setToken(null);
        deleteCookie(COOKIE_AUTH_TOKEN);
      }
    } catch {
      setUser(null);
      setClient(null);
      setToken(null);
      deleteCookie(COOKIE_AUTH_TOKEN);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const session = await authService.login(credentials);
      setUser(session.user);
      setToken(session.token || getCookie(COOKIE_AUTH_TOKEN));
      setClient(session.client || null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Backend logout encountered error, clearing local state:', err);
    } finally {
      setUser(null);
      setClient(null);
      setToken(null);
      deleteCookie(COOKIE_AUTH_TOKEN);
      setIsLoading(false);
    }
  };

  const registerClient = async (data: RegisterClientInput) => {
    setIsLoading(true);
    try {
      const session = await authService.registerClient(data);
      setUser(session.user);
      setToken(session.token || getCookie(COOKIE_AUTH_TOKEN));
      setClient(session.client || null);
    } finally {
      setIsLoading(false);
    }
  };

  const recoverPassword = async (email: string) => {
    return authService.recoverPassword(email);
  };

  const updateProfile = async (data: any) => {
    const session = await authService.updateProfile(data);
    if (session.user) setUser(session.user);
    if (session.client) setClient(session.client);
  };

  const changePassword = async (password: string) => {
    await authService.changePassword(password);
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      if (user.role === 'CLIENT') {
        const clientData = await clientService.getClient(user.id);
        setClient(clientData);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        client,
        isLoading,
        login,
        logout,
        registerClient,
        recoverPassword,
        updateProfile,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
