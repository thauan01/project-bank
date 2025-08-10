import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';
import { ClientsService } from '../../domain/service/clients.service';
import { UserRepository } from '../repository/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entity/user.entity';
import { getRabbitMQConfig, RABBITMQ_SERVICE } from '../../config/rabbitmq.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: RABBITMQ_SERVICE,
        ...getRabbitMQConfig(),
      },
    ]),
  ],
  providers: [
    RabbitMQConsumerService,
    RabbitMQPublisherService,
    ClientsService,
    UserRepository,
  ],
  exports: [RabbitMQConsumerService, RabbitMQPublisherService],
})
export class RabbitMQModule {}
