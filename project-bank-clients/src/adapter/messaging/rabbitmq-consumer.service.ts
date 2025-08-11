import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ClientsService } from '../../domain/service/clients.service';

@Injectable()
export class RabbitMQConsumerService {
  private readonly logger = new Logger(RabbitMQConsumerService.name);

  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Processa mensagens de transações bancárias para atualizar saldos dos clientes
   * Padrão: { userId: string, amount: number, transactionType: 'credit' | 'debit', transactionId: string }
   * Ou formato de transação completa: { senderUserId: string, receiverUserId: string, amount: number, transactionId: string, status: string }
   */
  @EventPattern('transaction.processed')
  async handleTransactionProcessed(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Processando transação: ${JSON.stringify(data)}`);


      await this.processTransferTransaction(data, channel, originalMsg);

      // Confirma o processamento da mensagem
      channel.ack(originalMsg);

    } catch (error) {
      this.logger.error('Erro ao processar transação:', error);
      
      // Em caso de erro, rejeita a mensagem e coloca de volta na fila
      // O false indica que a mensagem deve voltar para a fila
      channel.nack(originalMsg, false, true);
    }
  }

  private async processTransferTransaction(data: any, channel: any, originalMsg: any): Promise<void> {
    const { senderUserId, receiverUserId, amount, transactionId, status } = data;

    // Validação básica dos dados
    if (!senderUserId || !receiverUserId || !amount || !transactionId) {
      this.logger.error('Dados da transação de transferência inválidos:', data);
      channel.reject(originalMsg, false);
      return;
    }

    // Verifica se a transação foi bem-sucedida
    if (status && status !== 'success') {
      this.logger.warn(`Transação ${transactionId} falhou. Status: ${status}`);
      return;
    }

    // Busca o usuário remetente
    const sender = await this.clientsService.getClientById(senderUserId);
    if (!sender) {
      this.logger.error(`Usuário remetente não encontrado: ${senderUserId}`);
      channel.reject(originalMsg, false);
      return;
    }

    // Busca o usuário destinatário
    const receiver = await this.clientsService.getClientById(receiverUserId);
    if (!receiver) {
      this.logger.error(`Usuário destinatário não encontrado: ${receiverUserId}`);
      channel.reject(originalMsg, false);
      return;
    }

    // Calcula os novos saldos
    const newSenderBalance = sender.balance - amount;
    const newReceiverBalance = receiver.balance + amount;

    // Verifica se o remetente tem saldo suficiente (validação adicional)
    if (newSenderBalance < 0) {
      this.logger.error(`Saldo insuficiente para o usuário ${senderUserId}. Saldo atual: ${sender.balance}, Valor da transação: ${amount}`);
      channel.reject(originalMsg, false);
      return;
    }

    // Atualiza o saldo do remetente
    await this.clientsService.updateClient(senderUserId, { balance: newSenderBalance } as any);

    // Atualiza o saldo do destinatário
    await this.clientsService.updateClient(receiverUserId, { balance: newReceiverBalance } as any);

    this.logger.log(`Transferência ${transactionId} processada com sucesso`);
    this.logger.log(`Remetente ${senderUserId}: ${sender.balance} -> ${newSenderBalance}`);
    this.logger.log(`Destinatário ${receiverUserId}: ${receiver.balance} -> ${newReceiverBalance}`);
  }
}
