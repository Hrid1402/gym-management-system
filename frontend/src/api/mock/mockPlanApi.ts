import { IPlanApi } from '../planApi';
import { MembershipPlan, CreatePlanInput, UpdatePlanInput } from '../../types';
import {
  getMockStore,
  saveMockStore,
  delay,
  createApiError,
} from './mockStore';

export class MockPlanApi implements IPlanApi {
  async getPlans(): Promise<MembershipPlan[]> {
    await delay();
    const store = getMockStore();
    return [...store.plans];
  }

  async getActivePlans(): Promise<MembershipPlan[]> {
    await delay();
    const store = getMockStore();
    return store.plans.filter((p) => p.isActive);
  }

  async getPlan(id: string): Promise<MembershipPlan> {
    await delay();
    const store = getMockStore();
    const plan = store.plans.find((p) => p.id === id);
    if (!plan) {
      throw createApiError(`Plan con ID ${id} no encontrado`, 404);
    }
    return { ...plan };
  }

  async createPlan(data: CreatePlanInput): Promise<MembershipPlan> {
    await delay();
    const store = getMockStore();

    if (!data.name || !data.name.trim()) {
      throw createApiError('El nombre del plan es obligatorio', 400);
    }
    if (data.price <= 0) {
      throw createApiError('El precio del plan debe ser mayor a 0', 400);
    }
    if (data.durationDays <= 0) {
      throw createApiError('La duración del plan en días debe ser mayor a 0', 400);
    }

    const newPlan: MembershipPlan = {
      id: `PLN-${Date.now()}`,
      name: data.name.trim(),
      price: Number(data.price),
      durationDays: Number(data.durationDays),
      isActive: true,
    };

    store.plans.push(newPlan);
    saveMockStore(store);

    return newPlan;
  }

  async updatePlan(id: string, data: UpdatePlanInput): Promise<MembershipPlan> {
    await delay();
    const store = getMockStore();
    const index = store.plans.findIndex((p) => p.id === id);
    if (index === -1) {
      throw createApiError(`Plan con ID ${id} no encontrado`, 404);
    }

    const currentPlan = store.plans[index];

    const updatedPlan: MembershipPlan = {
      ...currentPlan,
      name: data.name !== undefined ? data.name.trim() : currentPlan.name,
      price: data.price !== undefined ? Number(data.price) : currentPlan.price,
      durationDays: data.durationDays !== undefined ? Number(data.durationDays) : currentPlan.durationDays,
    };

    store.plans[index] = updatedPlan;
    saveMockStore(store);

    return updatedPlan;
  }

  async updatePlanStatus(id: string, isActive: boolean): Promise<MembershipPlan> {
    await delay();
    const store = getMockStore();
    const index = store.plans.findIndex((p) => p.id === id);
    if (index === -1) {
      throw createApiError(`Plan con ID ${id} no encontrado`, 404);
    }

    store.plans[index].isActive = isActive;
    saveMockStore(store);

    return { ...store.plans[index] };
  }
}
