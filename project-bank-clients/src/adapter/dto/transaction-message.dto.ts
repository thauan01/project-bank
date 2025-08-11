export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export class TransactionMessageDto {
  transactionId: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: string;
};