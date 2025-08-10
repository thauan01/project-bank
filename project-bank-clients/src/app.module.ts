import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsController } from './adapter/controller/clients.controller';
import { DatabaseModule } from './adapter/database/database.module';
import { RabbitMQModule } from './adapter/messaging/rabbitmq.module';
import { ClientsService } from './domain/service/clients.service';
import { DI_USER_REPOSITORY } from './config/container-names.config';
import { UserRepository } from './adapter/repository/user.repository';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env', // Aponta para o .env do diretório pai
    }),
    DatabaseModule,
    RabbitMQModule,
  ],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    { provide: DI_USER_REPOSITORY, useClass: UserRepository }
  ],
})
export class AppModule {}
