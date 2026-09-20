import { IUserApi } from '../userApi';
import { User, UserRole, CreateStaffInput, UpdateStaffInput } from '../../types';
import { apiClient } from '../apiClient';

export class RealUserApi implements IUserApi {
  private mapUser(raw: any): User {
    return {
      id: raw.id,
      name: raw.name || `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
      email: raw.email,
      role: raw.role,
      isActive: raw.is_active !== undefined ? Boolean(raw.is_active) : (raw.isActive !== undefined ? Boolean(raw.isActive) : true),
      type: 'staff',
      createdAt: raw.created_at || raw.createdAt,
    };
  }

  async getUsers(): Promise<User[]> {
    try {
      const res = await apiClient.get<any>('users');
      const rows = Array.isArray(res) ? res : (res?.users || res?.data || []);
      return rows.map((r: any) => this.mapUser(r));
    } catch (err) {
      console.warn('Failed to fetch staff roster from /api/users:', err);
      return [];
    }
  }

  async createStaff(data: CreateStaffInput): Promise<User> {
    const res = await apiClient.post<any>('users', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });
    return this.mapUser(res.user || res.staff || res);
  }

  async updateUser(id: string, data: UpdateStaffInput): Promise<User> {
    const body: any = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.role !== undefined) body.role = data.role;
    if (data.isActive !== undefined) body.is_active = data.isActive;

    const res = await apiClient.put<any>(`users/${id}`, body);
    return this.mapUser(res.user || res.staff || res);
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    return this.updateUser(id, { role });
  }

  async activateUser(id: string): Promise<User> {
    return this.updateUser(id, { isActive: true });
  }

  async deactivateUser(id: string): Promise<User> {
    return this.updateUser(id, { isActive: false });
  }
}
