import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entity';
import { IUserRepository } from '../../domain/interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    
    // Gera um ID único de 4 dígitos se não foi fornecido
    if (!user.id) {
      user.id = await this.generateUniqueId();
    }
    
    return await this.repository.save(user);
  }

  private async generateUniqueId(): Promise<string> {
    let id: string;
    let exists: boolean;
    
    do {
      // Gera um número aleatório de 4 dígitos (1000-9999)
      id = Math.floor(1000 + Math.random() * 9000).toString();
      exists = await this.repository.exist({ where: { id } });
    } while (exists);
    
    return id;
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ 
      where: { id } 
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ 
      where: { email } 
    });
  }

  async findByDocument(document: string): Promise<User | null> {
    return await this.repository.findOne({ 
      where: { document } 
    });
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      where: { isActive: true }
    });
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }

  async updateBalance(id: string, newBalance: number): Promise<void> {
    await this.repository.update(id, { balance: newBalance });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { id, isActive: true } 
    });
    return count > 0;
  }
}
