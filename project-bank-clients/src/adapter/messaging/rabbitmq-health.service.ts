import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_SERVICE } from '../../config/rabbitmq.config';
import { lastValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable()
export class RabbitMQHealthService {
  private readonly logger = new Logger(RabbitMQHealthService.name);

  constructor(
    @Inject(RABBITMQ_SERVICE) 
    private readonly rabbitmqClient: ClientProxy,
  ) {}

  /**
   * Verifica se a conexão com RabbitMQ está saudável
   */
  async checkHealth(): Promise<{ status: 'healthy' | 'unhealthy', details?: string }> {
    try {
      // Tenta enviar uma mensagem de ping com timeout
      const result = await lastValueFrom(
        this.rabbitmqClient.send('health.ping', { timestamp: Date.now() }).pipe(
          timeout(5000), // 5 segundos timeout
          catchError(error => {
            this.logger.error('Health check falhou:', error);
            return of({ error: error.message });
          })
        )
      );

      if (result.error) {
        return { 
          status: 'unhealthy', 
          details: `Erro na conexão: ${result.error}` 
        };
      }

      return { status: 'healthy' };
    } catch (error) {
      this.logger.error('Erro durante health check:', error);
      return { 
        status: 'unhealthy', 
        details: `Conexão falhou: ${error.message}` 
      };
    }
  }

  /**
   * Força reconexão se necessário
   */
  async reconnect(): Promise<void> {
    try {
      await this.rabbitmqClient.close();
      await this.rabbitmqClient.connect();
      this.logger.log('Reconexão com RabbitMQ realizada com sucesso');
    } catch (error) {
      this.logger.error('Erro durante reconexão:', error);
      throw error;
    }
  }
}
