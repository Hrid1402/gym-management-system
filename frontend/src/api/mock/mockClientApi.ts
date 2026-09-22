import { IClientApi } from '../clientApi';
import { Client, UpdateClientInput } from '../../types';
import {
  getMockStore,
  saveMockStore,
  delay,
  createApiError,
} from './mockStore';

export class MockClientApi implements IClientApi {
  async getClients(search?: string): Promise<Client[]> {
    await delay();
    const store = getMockStore();
    if (!search || !search.trim()) {
      return [...store.clients];
    }
    const term = search.trim().toLowerCase();
    return store.clients.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return fullName.includes(term) || c.dni.toLowerCase().includes(term);
    });
  }

  async getClient(id: string): Promise<Client> {
    await delay();
    const store = getMockStore();
    const client = store.clients.find((c) => c.id === id);
    if (!client) {
      throw createApiError(`Cliente con ID ${id} no encontrado`, 404);
    }

    // Attach active or pending membership if exists
    const mem = store.memberships.find(
      (m) => m.clientId === id && (m.status === 'ACTIVE' || m.status === 'PENDING')
    );
    const plan = mem ? store.plans.find((p) => p.id === mem.planId) : null;

    return {
      ...client,
      currentMembership: mem && plan
        ? {
            id: mem.id,
            planName: plan.name,
            price: plan.price,
            startDate: mem.startDate,
            endDate: mem.endDate,
            status: mem.status,
          }
        : null,
    };
  }

  async updateClient(id: string, data: UpdateClientInput): Promise<Client> {
    await delay();
    const store = getMockStore();
    const index = store.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      throw createApiError(`Cliente con ID ${id} no encontrado`, 404);
    }

    const currentClient = store.clients[index];

    const updatedClient: Client = {
      ...currentClient,
      firstName: data.firstName !== undefined ? data.firstName.trim() : currentClient.firstName,
      lastName: data.lastName !== undefined ? data.lastName.trim() : currentClient.lastName,
      phone: data.phone !== undefined ? data.phone.trim() : currentClient.phone,
      address: data.address !== undefined ? data.address : currentClient.address,
      dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth : currentClient.dateOfBirth,
    };

    store.clients[index] = updatedClient;
    saveMockStore(store);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    await delay();
    const store = getMockStore();
    const index = store.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      throw createApiError(`Cliente con ID ${id} no encontrado`, 404);
    }

    const client = store.clients[index];
    store.clients.splice(index, 1);

    // Remove client user account simulation
    const userIndex = store.users.findIndex((u) => u.supabaseUserId === client.supabaseUserId);
    if (userIndex !== -1) {
      store.users.splice(userIndex, 1);
    }

    saveMockStore(store);
  }
}
