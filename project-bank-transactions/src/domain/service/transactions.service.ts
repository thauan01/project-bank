import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { TransactionRepository } from '../../adapter/repository/transaction.repository';
import { UserRepository } from '../../adapter/repository/user.repository';
import { TransactionRequest } from '../../adapter/dto/transaction-request.dto';
import { TransactionResponse } from '../../adapter/dto/transaction-response.dto';
import { TransactionDetailsResponse, TransactionDetails } from '../../adapter/dto/transaction-details.dto';
import { TransactionListResponse } from '../../adapter/dto/transaction-list.dto';
import { Transaction, TransactionStatus } from '../entity/transaction.entity';
import { DI_TRANSACTION_REPOSITORY, DI_USER_REPOSITORY } from '../../config/container-names';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(DI_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(DI_USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async createBankTransaction(transactionData: TransactionRequest): Promise<TransactionResponse> {
    try {
      // Validações de negócio
      await this.validateTransactionData(transactionData);

      // Verificar se os usuários existem
      const senderExists = await this.userRepository.exists(transactionData.senderUserId);
      const receiverExists = await this.userRepository.exists(transactionData.receiverUserId);

      if (!senderExists) {
        return {
          status: 'error',
          message: 'Usuário remetente não encontrado'
        };
      }

      if (!receiverExists) {
        return {
          status: 'error',
          message: 'Usuário destinatário não encontrado'
        };
      }

      // Verificar saldo do remetente
      const sender = await this.userRepository.findById(transactionData.senderUserId);
      if (sender.balance < transactionData.amount) {
        return {
          status: 'error',
          message: 'Saldo insuficiente para realizar a transação'
        };
      }

      // Criar a transação
      const transaction = await this.transactionRepository.create({
        senderUserId: transactionData.senderUserId,
        receiverUserId: transactionData.receiverUserId,
        amount: transactionData.amount,
        description: transactionData.description,
        status: TransactionStatus.PENDING
      });

      // Atualizar saldos dos usuários
      const receiver = await this.userRepository.findById(transactionData.receiverUserId);
      await this.userRepository.updateBalance(sender.id, sender.balance - transactionData.amount);
      await this.userRepository.updateBalance(receiver.id, receiver.balance + transactionData.amount);

      // Atualizar status da transação para COMPLETED
      await this.transactionRepository.updateStatus(transaction.id, TransactionStatus.COMPLETED);

      return {
        status: 'success',
        transactionId: transaction.id,
        message: 'Transação processada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return {
        status: 'error',
        message: 'Erro interno do servidor ao processar a transação'
      };
    }
  }

  async getTransactionDetailsById(transactionId: string): Promise<TransactionDetailsResponse> {
    try {
      if (!transactionId) {
        return {
          status: 'error',
          message: 'ID da transação é obrigatório'
        };
      }

      const transaction = await this.transactionRepository.findById(transactionId);

      if (!transaction) {
        return {
          status: 'error',
          message: 'Transação não encontrada'
        };
      }

      const transactionDetails: TransactionDetails = {
        transactionId: transaction.id,
        senderUserId: transaction.senderUserId,
        receiverUserId: transaction.receiverUserId,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status.toLowerCase(),
        createdAt: transaction.createdAt.toISOString()
      };

      return {
        status: 'success',
        data: transactionDetails,
        message: 'Detalhes da transação recuperados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return {
        status: 'error',
        message: 'Erro interno do servidor ao buscar a transação'
      };
    }
  }

  async getTransactionsByUserId(userId: string): Promise<TransactionListResponse> {
    try {
      if (!userId) {
        return {
          status: 'error',
          message: 'ID do usuário é obrigatório'
        };
      }

      // Verificar se o usuário existe
      const userExists = await this.userRepository.exists(userId);
      if (!userExists) {
        return {
          status: 'error',
          message: 'Usuário não encontrado'
        };
      }

      const transactions = await this.transactionRepository.findByUserId(userId);

      const transactionsList: TransactionDetails[] = transactions.map(transaction => ({
        transactionId: transaction.id,
        senderUserId: transaction.senderUserId,
        receiverUserId: transaction.receiverUserId,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status.toLowerCase(),
        createdAt: transaction.createdAt.toISOString()
      }));

      return {
        status: 'success',
        data: transactionsList,
        totalCount: transactionsList.length,
        message: 'Lista de transações do usuário recuperada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar transações do usuário:', error);
      return {
        status: 'error',
        message: 'Erro interno do servidor ao buscar as transações do usuário'
      };
    }
  }

  private async validateTransactionData(transactionData: TransactionRequest): Promise<void> {
    if (!transactionData.senderUserId || !transactionData.receiverUserId || 
        !transactionData.amount || !transactionData.description) {
      throw new BadRequestException('Todos os parâmetros são obrigatórios: senderUserId, receiverUserId, amount, description');
    }

    if (transactionData.amount <= 0) {
      throw new BadRequestException('O valor da transação deve ser maior que zero');
    }

    if (transactionData.senderUserId === transactionData.receiverUserId) {
      throw new BadRequestException('O usuário remetente não pode ser o mesmo que o destinatário');
    }
  }
}