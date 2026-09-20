import { MembershipPlan, CreatePlanInput, UpdatePlanInput } from '../types';

export interface IPlanApi {
  getPlans(): Promise<MembershipPlan[]>;
  getActivePlans(): Promise<MembershipPlan[]>;
  getPlan(id: string): Promise<MembershipPlan>;
  createPlan(data: CreatePlanInput): Promise<MembershipPlan>;
  updatePlan(id: string, data: UpdatePlanInput): Promise<MembershipPlan>;
  updatePlanStatus(id: string, isActive: boolean): Promise<MembershipPlan>;
}
