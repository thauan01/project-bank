import { TransactionDetails } from "../../adapter/dto/transaction-details.dto";

export interface IMessageProducer {
    publishTransactionCreated(transactionData: TransactionDetails): Promise<void>
}