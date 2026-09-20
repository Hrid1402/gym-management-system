import { IMembershipApi } from '../membershipApi';
import { Membership, StaffRegisterMembershipInput, WebRegisterMembershipInput } from '../../types';
import { apiClient } from '../apiClient';
import { clientService } from '../index';

export class RealMembershipApi implements IMembershipApi {
  private mapMembership(raw: any): Membership {
    return {
      id: raw.id,
      clientId: raw.client_id || raw.clientId || '',
      planId: raw.plan_id || raw.planId || '',
      startDate: raw.start_date || raw.startDate || '',
      endDate: raw.end_date || raw.endDate || '',
      status: raw.status,
      planName: raw.plan_name || raw.planName || 'Membership Plan',
      clientName: raw.client_name || (raw.first_name ? `${raw.first_name} ${raw.last_name}` : undefined),
    };
  }

  async getMemberships(): Promise<Membership[]> {
    try {
      const rows = await apiClient.get<any[]>('memberships');
      if (!Array.isArray(rows)) return [];
      return rows.map((r) => this.mapMembership(r));
    } catch (err) {
      console.warn('Backend GET /api/memberships unavailable or unhandled:', err);
      return [];
    }
  }

  async getClientMemberships(clientId: string): Promise<Membership[]> {
    const all = await this.getMemberships();
    return all.filter((m) => m.clientId === clientId || !m.clientId);
  }

  async getActiveClientMembership(clientId: string): Promise<Membership | null> {
    // Priority 1: Call GET /api/memberships (returns memberships array for logged-in user)
    try {
      const rows = await apiClient.get<any[]>('memberships');
      if (Array.isArray(rows) && rows.length > 0) {
        const mapped = rows.map((r) => this.mapMembership(r));
        const active = mapped.find((m) => m.status === 'ACTIVE');
        if (active) return active;

        const pending = mapped.find((m) => m.status === 'PENDING');
        if (pending) return pending;
      }
    } catch (err) {
      console.warn('Could not fetch active membership via GET /api/memberships:', err);
    }

    // Priority 2: Fallback to GET /api/clients/:id
    try {
      const client = await clientService.getClient(clientId);
      if (client.currentMembership) {
        return {
          id: client.currentMembership.id,
          clientId,
          planId: '',
          startDate: client.currentMembership.startDate,
          endDate: client.currentMembership.endDate,
          status: client.currentMembership.status,
          planName: client.currentMembership.planName,
        };
      }
    } catch (err) {
      console.warn('Could not fetch active membership via client detail:', err);
    }

    return null;
  }

  async staffRegisterMembership(data: StaffRegisterMembershipInput): Promise<Membership> {
    const res = await apiClient.post<{ message: string; membership: any }>('memberships/staff-register', {
      client_id: data.clientId,
      plan_id: data.planId,
      start_date: data.startDate,
    });
    return this.mapMembership(res.membership || res);
  }

  async webRegisterMembership(data: WebRegisterMembershipInput): Promise<Membership> {
    const res = await apiClient.post<{ message: string; membership: any }>('memberships/web-register', {
      plan_id: data.planId,
    });
    return this.mapMembership(res.membership || res);
  }

  async cancelMembership(id: string): Promise<Membership> {
    const res = await apiClient.patch<{ message: string; membership: any }>(`memberships/${id}/cancel`);
    return this.mapMembership(res.membership || res);
  }

  async cancelCurrentClientMembership(): Promise<Membership> {
    const res = await apiClient.patch<{ message: string; membership?: any }>('memberships/cancel');
    return this.mapMembership(res.membership || res);
  }
}
