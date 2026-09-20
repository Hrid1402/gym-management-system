import { User, UserRole, CreateStaffInput, UpdateStaffInput } from '../types';

export interface IUserApi {
  getUsers(): Promise<User[]>;
  createStaff(data: CreateStaffInput): Promise<User>;
  updateUser(id: string, data: UpdateStaffInput): Promise<User>;
  updateUserRole(id: string, role: UserRole): Promise<User>;
  activateUser(id: string): Promise<User>;
  deactivateUser(id: string): Promise<User>;
}
