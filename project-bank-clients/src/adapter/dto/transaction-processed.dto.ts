export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

export class TransactionProcessedDto {
  senderUserId: string;

  receiverUserId: string;

  amount: number;

  transactionId: string;

  status: TransactionStatus;
}
