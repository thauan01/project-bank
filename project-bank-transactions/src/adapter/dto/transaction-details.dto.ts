import { TransactionStatus } from "../../domain/enum/transaction-status.enum";

export type TransactionDetails = {
  transactionId: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: string;
};

export type TransactionDetailsResponse = {
  status: string;
  data?: TransactionDetails;
  message: string;
};
