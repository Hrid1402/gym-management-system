import { ApiError } from '../types';
import { getCookie, COOKIE_AUTH_TOKEN } from '../utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    const token = getCookie(COOKIE_AUTH_TOKEN);
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  async request<T>(endpoint: string, options: RequestInit & { timeout?: number } = {}): Promise<T> {
    const { timeout = 10000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const url = `${cleanBase}/${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // fallback to status text
        }
        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw apiError;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutError: ApiError = {
          message: `Request timed out (server did not respond within ${timeout / 1000}s)`,
          status: 504,
        };
        throw timeoutError;
      }
      if (err.message && err.status !== undefined) {
        throw err;
      }
      const apiError: ApiError = {
        message: err.message || 'Network error or server unreachable',
        status: 500,
      };
      throw apiError;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
