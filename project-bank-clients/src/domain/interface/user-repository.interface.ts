import { User } from '../entity';

export interface IUserRepository {
  create(userData: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByDocument(document: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, userData: Partial<User>): Promise<User | null>;
  softDelete(id: string): Promise<void>;
  updateBalance(id: string, newBalance: number): Promise<void>;
  exists(id: string): Promise<boolean>;
}
