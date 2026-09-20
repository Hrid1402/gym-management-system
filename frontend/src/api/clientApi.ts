import { Client, UpdateClientInput } from '../types';

export interface IClientApi {
  getClients(search?: string): Promise<Client[]>;
  getClient(id: string): Promise<Client>;
  updateClient(id: string, data: UpdateClientInput): Promise<Client>;
  deleteClient(id: string): Promise<void>;
}
