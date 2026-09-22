import { IUserApi } from '../userApi';
import { User, UserRole, CreateStaffInput, UpdateStaffInput } from '../../types';
import {
  getMockStore,
  saveMockStore,
  delay,
  createApiError,
} from './mockStore';

export class MockUserApi implements IUserApi {
  async getUsers(): Promise<User[]> {
    await delay();
    const store = getMockStore();
    // Return staff users (ADMIN & RECEPTIONIST)
    return store.users.filter((u) => u.role === 'ADMIN' || u.role === 'RECEPTIONIST');
  }

  async createStaff(data: CreateStaffInput): Promise<User> {
    await delay();
    const store = getMockStore();

    if (store.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw createApiError(`Ya existe un usuario registrado con el correo ${data.email}`, 400);
    }

    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: true,
      type: 'staff',
    };

    store.users.push(newUser);
    saveMockStore(store);

    return newUser;
  }

  async updateUser(id: string, data: UpdateStaffInput): Promise<User> {
    await delay();
    const store = getMockStore();
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw createApiError(`Usuario con ID ${id} no encontrado`, 404);
    }

    if (data.name !== undefined) store.users[index].name = data.name;
    if (data.role !== undefined) store.users[index].role = data.role;
    if (data.isActive !== undefined) store.users[index].isActive = data.isActive;

    saveMockStore(store);
    return { ...store.users[index] };
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    await delay();
    const store = getMockStore();
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw createApiError(`Usuario con ID ${id} no encontrado`, 404);
    }

    if (role === 'CLIENT') {
      throw createApiError('Los usuarios de tipo cliente se gestionan a través de la entidad Cliente', 400);
    }

    store.users[index].role = role;
    saveMockStore(store);

    return { ...store.users[index] };
  }

  async activateUser(id: string): Promise<User> {
    await delay();
    const store = getMockStore();
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw createApiError(`Usuario con ID ${id} no encontrado`, 404);
    }

    store.users[index].isActive = true;
    saveMockStore(store);

    return { ...store.users[index] };
  }

  async deactivateUser(id: string): Promise<User> {
    await delay();
    const store = getMockStore();
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw createApiError(`Usuario con ID ${id} no encontrado`, 404);
    }

    store.users[index].isActive = false;
    saveMockStore(store);

    return { ...store.users[index] };
  }
}
