import { IMembershipApi } from '../membershipApi';
import { Membership, StaffRegisterMembershipInput, WebRegisterMembershipInput } from '../../types';
import {
  getMockStore,
  saveMockStore,
  SESSION_KEY,
  delay,
  createApiError,
  calculateEndDate,
  calculateMembershipStatus,
  getTodayString,
} from './mockStore';

export class MockMembershipApi implements IMembershipApi {
  private refreshMembershipStatuses(memberships: Membership[]): Membership[] {
    let modified = false;
    const updated = memberships.map((m) => {
      const newStatus = calculateMembershipStatus(m.startDate, m.endDate, m.status);
      if (newStatus !== m.status) {
        modified = true;
        return { ...m, status: newStatus };
      }
      return m;
    });

    if (modified) {
      const store = getMockStore();
      store.memberships = updated;
      saveMockStore(store);
    }

    return updated;
  }

  async getMemberships(): Promise<Membership[]> {
    await delay();
    const store = getMockStore();
    return this.refreshMembershipStatuses(store.memberships);
  }

  async getClientMemberships(clientId: string): Promise<Membership[]> {
    await delay();
    const store = getMockStore();
    const refreshed = this.refreshMembershipStatuses(store.memberships);
    return refreshed.filter((m) => m.clientId === clientId);
  }

  async getActiveClientMembership(clientId: string): Promise<Membership | null> {
    await delay();
    const store = getMockStore();
    const refreshed = this.refreshMembershipStatuses(store.memberships);

    const active = refreshed.find((m) => m.clientId === clientId && m.status === 'ACTIVE');
    if (active) return { ...active };

    const pending = refreshed.find((m) => m.clientId === clientId && m.status === 'PENDING');
    if (pending) return { ...pending };

    return null;
  }

  async staffRegisterMembership(data: StaffRegisterMembershipInput): Promise<Membership> {
    await delay();
    const store = getMockStore();

    const client = store.clients.find((c) => c.id === data.clientId);
    if (!client) {
      throw createApiError(`Client with ID ${data.clientId} not found`, 404);
    }

    const plan = store.plans.find((p) => p.id === data.planId);
    if (!plan || !plan.isActive) {
      throw createApiError('Plan not found or inactive', 404);
    }

    const existingActive = store.memberships.find(
      (m) => m.clientId === data.clientId && (m.status === 'ACTIVE' || m.status === 'PENDING')
    );
    if (existingActive) {
      throw createApiError('This client already has an active or pending membership. Cancel it first.', 400);
    }

    const startDate = data.startDate || getTodayString();
    const endDate = calculateEndDate(startDate, plan.durationDays);
    const status = calculateMembershipStatus(startDate, endDate);

    const newMembership: Membership = {
      id: `MEM-${Date.now()}`,
      clientId: data.clientId,
      planId: data.planId,
      startDate,
      endDate,
      status,
      planName: plan.name,
      clientName: `${client.firstName} ${client.lastName}`,
    };

    store.memberships.push(newMembership);
    saveMockStore(store);

    return newMembership;
  }

  async webRegisterMembership(data: WebRegisterMembershipInput): Promise<Membership> {
    await delay();
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!sessionRaw) {
      throw createApiError('Unauthenticated session', 401);
    }

    const session = JSON.parse(sessionRaw);
    if (!session.client?.id) {
      throw createApiError('Only clients can use the web registration flow', 403);
    }

    const clientId = session.client.id;
    const store = getMockStore();

    const plan = store.plans.find((p) => p.id === data.planId);
    if (!plan || !plan.isActive) {
      throw createApiError('Plan not found or inactive', 404);
    }

    const existingActive = store.memberships.find(
      (m) => m.clientId === clientId && (m.status === 'ACTIVE' || m.status === 'PENDING')
    );
    if (existingActive) {
      throw createApiError('You already have an active membership. Please cancel it before buying a new one.', 400);
    }

    const startDate = getTodayString();
    const endDate = calculateEndDate(startDate, plan.durationDays);
    const status = calculateMembershipStatus(startDate, endDate);

    const newMembership: Membership = {
      id: `MEM-${Date.now()}`,
      clientId,
      planId: data.planId,
      startDate,
      endDate,
      status,
      planName: plan.name,
      clientName: `${session.client.firstName} ${session.client.lastName}`,
    };

    store.memberships.push(newMembership);
    saveMockStore(store);

    return newMembership;
  }

  async cancelMembership(id: string): Promise<Membership> {
    await delay();
    const store = getMockStore();
    const index = store.memberships.findIndex((m) => m.id === id);
    if (index === -1) {
      throw createApiError(`Membership with ID ${id} not found`, 404);
    }

    const mem = store.memberships[index];
    if (mem.status === 'CANCELLED' || mem.status === 'EXPIRED') {
      throw createApiError(`Membership is already ${mem.status.toLowerCase()}`, 400);
    }

    store.memberships[index].status = 'CANCELLED';
    saveMockStore(store);

    return { ...store.memberships[index] };
  }

  async cancelCurrentClientMembership(): Promise<Membership> {
    await delay();
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!sessionRaw) {
      throw createApiError('Unauthenticated session', 401);
    }

    const session = JSON.parse(sessionRaw);
    const clientId = session.client?.id || session.user?.id;
    if (!clientId) {
      throw createApiError('Unauthenticated client session', 401);
    }

    const store = getMockStore();
    const active = store.memberships.find(
      (m) => m.clientId === clientId && (m.status === 'ACTIVE' || m.status === 'PENDING')
    );
    if (!active) {
      throw createApiError('No active membership found to cancel', 404);
    }

    return this.cancelMembership(active.id);
  }
}
