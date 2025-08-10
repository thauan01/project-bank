import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransactionRequest } from '../dto/transaction-request.dto';
import { TransactionResponse } from '../dto/transaction-response.dto';
import { TransactionDetailsResponse } from '../dto/transaction-details.dto';
import { TransactionListResponse } from '../dto/transaction-list.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from '../../domain/service/transactions.service';

@ApiTags('transactions')
@Controller('api')
export class BankTransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Create a new bank transaction' })
  @ApiResponse({ status: 200, description: 'Transaction created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid transaction data.' })
  @Post('transactions')
  async createTransaction(@Body() transactionData: TransactionRequest): Promise<TransactionResponse> {
    return await this.transactionsService.createBankTransaction(transactionData);
  }

  @ApiOperation({ summary: 'Get transaction details by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @Get('transactions/:transactionId')
  async getTransactionDetails(@Param('transactionId') transactionId: string): Promise<TransactionDetailsResponse> {
    return await this.transactionsService.getTransactionDetailsById(transactionId);
  }

  @ApiOperation({ summary: 'Get transactions list by user ID' })
  @ApiResponse({ status: 200, description: 'User transactions retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid user ID.' })
  @Get('transactions/user/:userId')
  async getUserTransactions(@Param('userId') userId: string): Promise<TransactionListResponse> {
    return await this.transactionsService.getTransactionsByUserId(userId);
  }
}