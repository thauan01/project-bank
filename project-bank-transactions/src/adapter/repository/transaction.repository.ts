import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../../domain/entity/transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.repository.create(transactionData);
    return await this.repository.save(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['sender', 'receiver']
    });
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.repository.find({
      where: [
        { senderUserId: userId },
        { receiverUserId: userId }
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' }
    });
  }

  async findBySenderId(senderUserId: string): Promise<Transaction[]> {
    return await this.repository.find({
      where: { senderUserId },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByReceiverId(receiverUserId: string): Promise<Transaction[]> {
    return await this.repository.find({
      where: { receiverUserId },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByStatus(status: TransactionStatus): Promise<Transaction[]> {
    return await this.repository.find({
      where: { status },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' }
    });
  }

  async findAll(limit?: number, offset?: number): Promise<[Transaction[], number]> {
    const query = this.repository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.sender', 'sender')
      .leftJoinAndSelect('transaction.receiver', 'receiver')
      .orderBy('transaction.createdAt', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    return await query.getManyAndCount();
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction | null> {
    await this.repository.update(id, { status });
    return await this.findById(id);
  }

  async update(id: string, transactionData: Partial<Transaction>): Promise<Transaction | null> {
    await this.repository.update(id, transactionData);
    return await this.findById(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { id } 
    });
    return count > 0;
  }
}
