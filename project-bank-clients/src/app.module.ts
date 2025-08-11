import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsController } from './adapter/controller/clients.controller';
import { MessageReceiverController } from './adapter/controller/message-receiver.controller';
import { DatabaseModule } from './adapter/database/database.module';
import { RabbitMQModule } from './adapter/messaging/rabbitmq.module';
import { ClientsService } from './domain/service/clients.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    DatabaseModule,
    RabbitMQModule,
  ],
  controllers: [ClientsController, MessageReceiverController],
  providers: [
  ],
})
export class AppModule {}
