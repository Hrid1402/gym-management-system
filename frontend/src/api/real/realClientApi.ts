import { IClientApi } from '../clientApi';
import { Client, UpdateClientInput } from '../../types';
import { apiClient } from '../apiClient';
import { formatDateForInput } from '../../utils/dateUtils';

export class RealClientApi implements IClientApi {
  private mapClient(raw: any): Client {
    return {
      id: raw.id,
      dni: raw.dni || '',
      firstName: raw.first_name || '',
      lastName: raw.last_name || '',
      phone: raw.phone || '',
      email: raw.email || '',
      dateOfBirth: formatDateForInput(raw.date_of_birth),
      address: raw.address || '',
      isActive: true,
      currentMembership: raw.current_membership
        ? {
            id: raw.current_membership.id,
            planName: raw.current_membership.plan_name,
            price: Number(raw.current_membership.price),
            startDate: raw.current_membership.start_date,
            endDate: raw.current_membership.end_date,
            status: raw.current_membership.status,
          }
        : null,
    };
  }

  async getClients(search?: string): Promise<Client[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const rows = await apiClient.get<any[]>(`clients/${query}`);
    return rows.map((r) => this.mapClient(r));
  }

  async getClient(id: string): Promise<Client> {
    const raw = await apiClient.get<any>(`clients/${id}`);
    return this.mapClient(raw);
  }

  async updateClient(id: string, data: UpdateClientInput): Promise<Client> {
    const body: any = {};
    if (data.firstName !== undefined) body.first_name = data.firstName;
    if (data.lastName !== undefined) body.last_name = data.lastName;
    if (data.phone !== undefined) body.phone = data.phone;
    if (data.address !== undefined) body.address = data.address;
    if (data.dateOfBirth !== undefined) body.date_of_birth = data.dateOfBirth ? formatDateForInput(data.dateOfBirth) : null;

    const res = await apiClient.put<{ message: string; client: any }>(`clients/${id}`, body);
    return this.mapClient(res.client || res);
  }

  async deleteClient(id: string): Promise<void> {
    await apiClient.delete<any>(`clients/${id}`);
  }
}
