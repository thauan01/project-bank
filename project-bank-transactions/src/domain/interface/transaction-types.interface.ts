import { TransactionStatus } from '../enum/transaction-status.enum';

export type TransactionRequestData = {
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
}

export type TransactionOperationResult ={
  status: string;
  transactionId?: string;
  message: string;
}

export type TransactionDetailsData = {
  transactionId: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: string;
}

export type TransactionDetailsResult ={
  status: string;
  data?: TransactionDetailsData;
  message: string;
}

export type TransactionListResult = {
  status: string;
  data?: TransactionDetailsData[];
  message: string;
  totalCount?: number;
}
