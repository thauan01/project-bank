import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { environmentConfig } from '../../config/environment.config';
import { RabbitMQConsumerService } from '../messaging/rabbitmq-consumer.service';

@Controller()
export class MessageReceiverController {
  private readonly logger = new Logger(MessageReceiverController.name);

  constructor(
    private readonly rabbitMQConsumerService: RabbitMQConsumerService
  ) {}

   /**
   * Message Receiver from RabbitMQ
   * Transaction Created - Message from Transactions Service
   */
  @MessagePattern(environmentConfig.rabbitMqQueue)
  async handleMessage(
    @Payload() message: any,
    @Ctx() context: RmqContext
  ) {
    this.logger.log('Mensagem recebida:', message);
    
    try {
      // Encaminha a mensagem para o RabbitMQConsumerService
      await this.rabbitMQConsumerService.handleTransactionProcessed(message, context);
    } catch (error) {
      this.logger.error('Erro ao processar mensagem:', error);
      // Em caso de erro, rejeita a mensagem
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }
}