import { Membership, StaffRegisterMembershipInput, WebRegisterMembershipInput } from '../types';

export interface IMembershipApi {
  getMemberships(): Promise<Membership[]>;
  getClientMemberships(clientId: string): Promise<Membership[]>;
  getActiveClientMembership(clientId: string): Promise<Membership | null>;
  staffRegisterMembership(data: StaffRegisterMembershipInput): Promise<Membership>;
  webRegisterMembership(data: WebRegisterMembershipInput): Promise<Membership>;
  cancelMembership(id: string): Promise<Membership>;
  cancelCurrentClientMembership(): Promise<Membership>;
}
