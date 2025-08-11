import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TransactionRequest } from '../dto/transaction-request.dto';
import { TransactionDetails } from '../dto/transaction-details.dto';

@Injectable()
export class MessageProducerService {
  private readonly logger = new Logger(MessageProducerService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * Publica uma mensagem sobre uma nova transação criada
   */
  async publishTransactionCreated(transactionData: TransactionDetails): Promise<void> {
    try {
      const message: TransactionRequest = {
        senderUserId: transactionData.senderUserId,
        receiverUserId: transactionData.receiverUserId,
        amount: transactionData.amount,
        description: transactionData.description,
      };

      await this.client.emit('transaction.created', message);
      this.logger.log(`Mensagem de transação criada enviada: ${transactionData.transactionId} para usuário recebedor ${transactionData.receiverUserId}`);
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem de transação criada:', error);
      throw error;
    }
  }


  /**
   * Fecha a conexão com o RabbitMQ (chamado quando a aplicação é finalizada)
   */
  async onModuleDestroy() {
    try {
      await this.client.close();
      this.logger.log('Conexão com RabbitMQ fechada com sucesso');
    } catch (error) {
      this.logger.error('Erro ao fechar conexão com RabbitMQ:', error);
    }
  }
}