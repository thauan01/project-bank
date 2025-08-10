export type TransactionDetails = {
  transactionId: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
};

export type TransactionDetailsResponse = {
  status: string;
  data?: TransactionDetails;
  message: string;
};
