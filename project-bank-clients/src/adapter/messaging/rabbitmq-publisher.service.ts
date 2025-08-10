import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_SERVICE } from '../../config/rabbitmq.config';

@Injectable()
export class RabbitMQPublisherService {
  private readonly logger = new Logger(RabbitMQPublisherService.name);

  constructor(
    @Inject(RABBITMQ_SERVICE) private readonly client: ClientProxy,
  ) {}

  /**
   * Publica uma mensagem de confirmação de atualização de cliente
   */
  async publishClientUpdated(userId: string, updateData: any) {
    try {
      const message = {
        userId,
        updateData,
        timestamp: new Date().toISOString(),
      };

      this.client.emit('client.updated', message);
      this.logger.log(`Mensagem de atualização de cliente enviada: ${userId}`);
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem de atualização de cliente:', error);
    }
  }

  /**
   * Publica uma mensagem de confirmação de criação de cliente
   */
  async publishClientCreated(userId: string, clientData: any) {
    try {
      const message = {
        userId,
        clientData,
        timestamp: new Date().toISOString(),
      };

      this.client.emit('client.created', message);
      this.logger.log(`Mensagem de criação de cliente enviada: ${userId}`);
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem de criação de cliente:', error);
    }
  }
}
