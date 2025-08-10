import { TransactionDetails } from './transaction-details.dto';

export type TransactionListResponse = {
  status: string;
  data?: TransactionDetails[];
  message: string;
  totalCount?: number;
};
