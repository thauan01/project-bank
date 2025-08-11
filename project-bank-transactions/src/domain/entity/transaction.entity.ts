import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionStatus } from '../enum/transaction-status.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  transactionId: string;

  @Column({ type: 'uuid' })
  senderUserId: string;

  @Column({ type: 'uuid' })
  receiverUserId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: TransactionStatus, 
    default: TransactionStatus.PENDING 
  })
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
