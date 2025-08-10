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

      const { userId, amount, transactionType, transactionId } = data;

      // Validação básica dos dados
      if (!userId || !amount || !transactionType || !transactionId) {
        this.logger.error('Dados da transação inválidos:', data);
        // Reject da mensagem em caso de dados inválidos
        channel.reject(originalMsg, false);
        return;
      }

      // Busca o cliente para verificar se existe
      const client = await this.clientsService.getClientById(userId);
      if (!client) {
        this.logger.error(`Cliente não encontrado: ${userId}`);
        // Reject da mensagem se cliente não existir
        channel.reject(originalMsg, false);
        return;
      }

      // Calcula o novo saldo baseado no tipo de transação
      let newBalance = client.balance || 0;
      if (transactionType === 'credit') {
        newBalance += amount;
      } else if (transactionType === 'debit') {
        newBalance -= amount;
      } else {
        this.logger.error(`Tipo de transação inválido: ${transactionType}`);
        channel.reject(originalMsg, false);
        return;
      }

      // Atualiza o saldo do cliente
      await this.clientsService.updateClient(userId, { balance: newBalance });

      this.logger.log(
        `Saldo atualizado para cliente ${userId}: ${client.balance} -> ${newBalance}`,
      );

      // Confirma o processamento da mensagem
      channel.ack(originalMsg);

    } catch (error) {
      this.logger.error('Erro ao processar transação:', error);
      
      // Em caso de erro, rejeita a mensagem e coloca de volta na fila
      // O false indica que a mensagem deve voltar para a fila
      channel.nack(originalMsg, false, true);
    }
  }

  /**
   * Processa mensagens de criação de conta bancária
   * Padrão: { userId: string, agency?: string, accountNumber?: string }
   */
  @EventPattern('account.created')
  async handleAccountCreated(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Processando criação de conta: ${JSON.stringify(data)}`);

      const { userId, agency, accountNumber } = data;

      if (!userId) {
        this.logger.error('UserId é obrigatório para criação de conta');
        channel.reject(originalMsg, false);
        return;
      }

      // Atualiza os dados bancários do cliente
      const updateData: any = {};
      if (agency) updateData.agency = agency;
      if (accountNumber) updateData.accountNumber = accountNumber;

      await this.clientsService.updateClient(userId, updateData);

      this.logger.log(`Dados bancários atualizados para cliente ${userId}`);
      channel.ack(originalMsg);

    } catch (error) {
      this.logger.error('Erro ao processar criação de conta:', error);
      channel.nack(originalMsg, false, true);
    }
  }
}
