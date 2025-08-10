import { Transaction, TransactionStatus } from '../entity/transaction.entity';

export interface ITransactionRepository {
  create(transactionData: Partial<Transaction>): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  findBySenderId(senderUserId: string): Promise<Transaction[]>;
  findByReceiverId(receiverUserId: string): Promise<Transaction[]>;
  findByStatus(status: TransactionStatus): Promise<Transaction[]>;
  findAll(limit?: number, offset?: number): Promise<[Transaction[], number]>;
  updateStatus(id: string, status: TransactionStatus): Promise<Transaction | null>;
  update(id: string, transactionData: Partial<Transaction>): Promise<Transaction | null>;
  exists(id: string): Promise<boolean>;
}