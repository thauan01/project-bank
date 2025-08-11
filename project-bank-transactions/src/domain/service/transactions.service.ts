import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { Transaction } from '../entity/transaction.entity';
import { DI_MESSAGE_PRODUCER_SERVICE, DI_TRANSACTION_REPOSITORY, DI_USER_INTEGRATION_SERVICE } from '../../config/container-names';
import { 
  ITransactionRepository, 
  IUserIntegrationService, 
  UserApiResponse,
  TransactionRequestData,
  TransactionOperationResult,
  TransactionDetailsData,
  TransactionDetailsResult,
  TransactionListResult
} from '../interface';
import { TransactionStatus } from '../enum/transaction-status.enum';
import { IMessageProducer } from '../interface/message-producer.interface';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(DI_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(DI_USER_INTEGRATION_SERVICE)
    private readonly userService: IUserIntegrationService,
    @Inject(DI_MESSAGE_PRODUCER_SERVICE)
    private readonly messageProducerService: IMessageProducer,
  ) {}

  async createBankTransaction(transactionData: TransactionRequestData): Promise<TransactionOperationResult> {
    try {
      // Validações de negócio
      await this.validateTransactionData(transactionData);

      // Validar usuários e saldo
      await this.validateUsersAndBalance(transactionData);

      // Criar a transação
      const transaction = await this.transactionRepository.create({
        senderUserId: transactionData.senderUserId,
        receiverUserId: transactionData.receiverUserId,
        amount: transactionData.amount,
        description: transactionData.description,
        status: TransactionStatus.PENDING
      });

      // Atualizar saldos dos usuários
      const messageToClientService = this.mapTransactionToDetails(transaction);
      await this.messageProducerService.publishTransactionCreated(messageToClientService);

      // Atualizar status da transação para COMPLETED
      await this.transactionRepository.updateStatus(transaction.transactionId, TransactionStatus.COMPLETED);

      return {
        status: 'success',
        transactionId: transaction.transactionId,
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

  async getTransactionDetailsById(transactionId: string): Promise<TransactionDetailsResult> {
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

      const transactionDetails: TransactionDetailsData = {
        transactionId: transaction.transactionId,
        senderUserId: transaction.senderUserId,
        receiverUserId: transaction.receiverUserId,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
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

  async getTransactionsByUserId(userId: string): Promise<TransactionListResult> {
    try {
      if (!userId) {
        return {
          status: 'error',
          message: 'ID do usuário é obrigatório'
        };
      }

      // Verificar se o usuário existe
      const userExists = await this.userService.getUserById(userId);
      if (!userExists) {
        throw new BadRequestException('Usuário não encontrado');
      }

      const transactions = await this.transactionRepository.findByUserId(userId);

      const transactionsList: TransactionDetailsData[] = transactions.map(transaction => ({
        transactionId: transaction.transactionId,
        senderUserId: transaction.senderUserId,
        receiverUserId: transaction.receiverUserId,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
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

  private async validateUsersAndBalance(transactionData: TransactionRequestData): Promise<{ senderUser: UserApiResponse; receiverUser: UserApiResponse }> {
    // Verificar se os usuários existem
    const senderUser = await this.userService.getUserById(transactionData.senderUserId);
    const receiverUser = await this.userService.getUserById(transactionData.receiverUserId);

    if (!senderUser) {
      throw new NotFoundException('Usuário remetente não encontrado');
    }

    if (!receiverUser) {
      throw new NotFoundException('Usuário destinatário não encontrado');
    }

    // Verificar saldo do remetente
    if (senderUser.balance < transactionData.amount) {
      throw new BadRequestException('Saldo insuficiente para realizar a transação');
    }

    return { senderUser, receiverUser };
  }

  private async validateTransactionData(transactionData: TransactionRequestData): Promise<void> {
    if (!transactionData.senderUserId || !transactionData.receiverUserId || 
        !transactionData.amount) {
      throw new BadRequestException('Os parâmetros são obrigatórios: senderUserId, receiverUserId, amount');
    }

    if (transactionData.amount <= 0) {
      throw new BadRequestException('O valor da transação deve ser maior que zero');
    }

    if (transactionData.senderUserId === transactionData.receiverUserId) {
      throw new BadRequestException('O usuário remetente não pode ser o mesmo que o destinatário');
    }
  }

  private mapTransactionToDetails(transaction: Transaction): TransactionDetailsData {
    return {
      transactionId: transaction.transactionId,
      senderUserId: transaction.senderUserId,
      receiverUserId: transaction.receiverUserId,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString()
    };
  }
}