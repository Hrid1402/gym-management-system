import { IPlanApi } from '../planApi';
import { MembershipPlan, CreatePlanInput, UpdatePlanInput } from '../../types';
import { apiClient } from '../apiClient';

export class RealPlanApi implements IPlanApi {
  private mapPlan(raw: any): MembershipPlan {
    return {
      id: raw.id,
      name: raw.name,
      price: Number(raw.price),
      durationDays: Number(raw.duration_days),
      isActive: Boolean(raw.is_active),
    };
  }

  async getPlans(): Promise<MembershipPlan[]> {
    const rows = await apiClient.get<any[]>('plans/');
    return rows.map((r) => this.mapPlan(r));
  }

  async getActivePlans(): Promise<MembershipPlan[]> {
    const rows = await apiClient.get<any[]>('plans/');
    return rows.map((r) => this.mapPlan(r)).filter((p) => p.isActive);
  }

  async getPlan(id: string): Promise<MembershipPlan> {
    const raw = await apiClient.get<any>(`plans/${id}`);
    return this.mapPlan(raw);
  }

  async createPlan(data: CreatePlanInput): Promise<MembershipPlan> {
    const res = await apiClient.post<{ message: string; plan: any }>('plans/', {
      name: data.name,
      price: data.price,
      duration_days: data.durationDays,
    });
    return this.mapPlan(res.plan || res);
  }

  async updatePlan(id: string, data: UpdatePlanInput): Promise<MembershipPlan> {
    const body: any = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.price !== undefined) body.price = data.price;
    if (data.durationDays !== undefined) body.duration_days = data.durationDays;

    const res = await apiClient.put<{ message: string; plan: any }>(`plans/${id}`, body);
    return this.mapPlan(res.plan || res);
  }

  async updatePlanStatus(id: string, isActive: boolean): Promise<MembershipPlan> {
    const res = await apiClient.patch<{ message: string; plan: any }>(`plans/${id}/status`, {
      is_active: isActive,
    });
    return this.mapPlan(res.plan || res);
  }
}
