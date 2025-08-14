import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ClientsService } from '../../domain/service/clients.service';

interface TransactionProcessedMessage {
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  timestamp?: string;
}

@Injectable()
export class RabbitMQConsumerService {
  private readonly logger = new Logger(RabbitMQConsumerService.name);
  private readonly maxRetries = 3;

  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Processa mensagens de transações bancárias para atualizar saldos dos clientes
   */
  @EventPattern('transaction.processed')
  async handleTransactionProcessed(
    @Payload() data: TransactionProcessedMessage,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const retryCount = this.getRetryCount(originalMsg);

    try {
      this.logger.log(`Processando transação (tentativa ${retryCount + 1}): ${JSON.stringify(data)}`);

      // Valida os dados da mensagem
      this.validateMessage(data);

      // Processa apenas transações bem-sucedidas
      if (data.status !== 'success') {
        this.logger.warn(`Transação ${data.transactionId} não processada. Status: ${data.status}`);
        channel.ack(originalMsg);
        return;
      }

      // Processa a transação em uma transação de banco de dados
      await this.processTransferTransactionSafely(data);

      // Confirma o processamento da mensagem
      channel.ack(originalMsg);
      this.logger.log(`Transação ${data.transactionId} processada com sucesso`);

    } catch (error) {
      this.logger.error(`Erro ao processar transação ${data.transactionId}:`, error);
      
      if (retryCount < this.maxRetries) {
        this.logger.warn(`Reenviando mensagem para retry (${retryCount + 1}/${this.maxRetries})`);
        channel.nack(originalMsg, false, true);
      } else {
        this.logger.error(`Máximo de tentativas excedido para transação ${data.transactionId}. Movendo para DLQ`);
        // Rejeita definitivamente após esgotar tentativas
        channel.nack(originalMsg, false, false);
      }
    }
  }

  private validateMessage(data: any): void {
    const requiredFields = ['senderUserId', 'receiverUserId', 'amount', 'transactionId', 'status'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Valor da transação deve ser um número positivo');
    }

    if (!['success', 'failed', 'pending'].includes(data.status)) {
      throw new Error(`Status inválido: ${data.status}`);
    }
  }

  private async processTransferTransactionSafely(data: TransactionProcessedMessage): Promise<void> {
    const { senderUserId, receiverUserId, amount, transactionId } = data;

    // Busca ambos os usuários
    const [sender, receiver] = await Promise.all([
      this.clientsService.getClientById(senderUserId),
      this.clientsService.getClientById(receiverUserId)
    ]);

    if (!sender) {
      throw new Error(`Usuário remetente não encontrado: ${senderUserId}`);
    }

    if (!receiver) {
      throw new Error(`Usuário destinatário não encontrado: ${receiverUserId}`);
    }

    // Calcula os novos saldos
    const newSenderBalance = sender.balance - amount;
    const newReceiverBalance = receiver.balance + amount;

    // Verifica se o remetente tem saldo suficiente
    if (newSenderBalance < 0) {
      throw new Error(`Saldo insuficiente para o usuário ${senderUserId}. Saldo atual: ${sender.balance}, Valor da transação: ${amount}`);
    }

    // TODO: Implementar transação de banco de dados aqui
    // Em uma implementação real, isso deveria ser uma transação atômica
    try {
      await Promise.all([
        this.clientsService.updateClient(senderUserId, { balance: newSenderBalance } as any),
        this.clientsService.updateClient(receiverUserId, { balance: newReceiverBalance } as any)
      ]);

      this.logger.log(`Transferência ${transactionId} processada com sucesso`);
      this.logger.log(`Remetente ${senderUserId}: ${sender.balance} -> ${newSenderBalance}`);
      this.logger.log(`Destinatário ${receiverUserId}: ${receiver.balance} -> ${newReceiverBalance}`);
    } catch (updateError) {
      this.logger.error(`Erro ao atualizar saldos para transação ${transactionId}:`, updateError);
      throw updateError;
    }
  }

  private getRetryCount(message: any): number {
    // Extrai o número de tentativas dos headers da mensagem
    return message.properties?.headers?.['x-retry-count'] || 0;
  }
}
