import { TransactionRequest } from '../dto/transaction-request.dto';
import { TransactionResponse } from '../dto/transaction-response.dto';
import { TransactionDetailsResponse, TransactionDetails } from '../dto/transaction-details.dto';
import { TransactionListResponse } from '../dto/transaction-list.dto';
import { 
  TransactionRequestData,
  TransactionOperationResult,
  TransactionDetailsData,
  TransactionDetailsResult,
  TransactionListResult
} from '../../domain/interface';

/**
 * Mappers para converter entre DTOs da camada de adaptador e tipos do domínio
 */
export class TransactionMappers {
  
  /**
   * Converte TransactionRequest (DTO) para TransactionRequestData (Domain)
   */
  static toTransactionRequestData(dto: TransactionRequest): TransactionRequestData {
    return {
      senderUserId: dto.senderUserId,
      receiverUserId: dto.receiverUserId,
      amount: dto.amount,
      description: dto.description
    };
  }

  /**
   * Converte TransactionOperationResult (Domain) para TransactionResponse (DTO)
   */
  static toTransactionResponse(domainResult: TransactionOperationResult): TransactionResponse {
    return {
      status: domainResult.status,
      transactionId: domainResult.transactionId,
      message: domainResult.message
    };
  }

  /**
   * Converte TransactionDetailsResult (Domain) para TransactionDetailsResponse (DTO)
   */
  static toTransactionDetailsResponse(domainResult: TransactionDetailsResult): TransactionDetailsResponse {
    return {
      status: domainResult.status,
      data: domainResult.data ? this.toTransactionDetails(domainResult.data) : undefined,
      message: domainResult.message
    };
  }

  /**
   * Converte TransactionListResult (Domain) para TransactionListResponse (DTO)
   */
  static toTransactionListResponse(domainResult: TransactionListResult): TransactionListResponse {
    return {
      status: domainResult.status,
      data: domainResult.data ? domainResult.data.map(this.toTransactionDetails) : undefined,
      message: domainResult.message,
      totalCount: domainResult.totalCount
    };
  }

  /**
   * Converte TransactionDetailsData (Domain) para TransactionDetails (DTO)
   */
  private static toTransactionDetails(domainData: TransactionDetailsData): TransactionDetails {
    return {
      transactionId: domainData.transactionId,
      senderUserId: domainData.senderUserId,
      receiverUserId: domainData.receiverUserId,
      amount: domainData.amount,
      description: domainData.description,
      status: domainData.status,
      createdAt: domainData.createdAt
    };
  }
}
