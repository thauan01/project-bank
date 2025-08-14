import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';
import { RabbitMQHealthService } from './rabbitmq-health.service';
import { ClientsService } from '../../domain/service/clients.service';
import { DatabaseModule } from '../database/database.module';
import { getRabbitMQConfig, RABBITMQ_SERVICE } from '../../config/rabbitmq.config';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: RABBITMQ_SERVICE,
        ...getRabbitMQConfig(),
      },
    ]),
  ],
  providers: [
    RabbitMQConsumerService,
    RabbitMQHealthService,
    ClientsService,
  ],
  exports: [
    RabbitMQConsumerService, 
    RabbitMQHealthService,
    ClientsService
  ],
})
export class RabbitMQModule {}
