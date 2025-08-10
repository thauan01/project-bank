import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BankTransactionsController } from './adapter/controller/bank-transactions.controller';
import { DatabaseModule } from './adapter/database/database.module';
import { TransactionsService } from './domain/service/transactions.service';
import { TransactionRepository } from './adapter/repository/transaction.repository';
import { UserRepository } from './adapter/repository/user.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DI_TRANSACTION_REPOSITORY, DI_USER_REPOSITORY } from './config/container-names';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '../.env', // Aponta para o .env do diretório pai
    }),
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: process.env.RABBITMQ_QUEUE || 'bank-transaction-to-client-queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [BankTransactionsController],
  providers: [
    TransactionsService,
    {provide: DI_TRANSACTION_REPOSITORY, useClass: TransactionRepository},
    {provide: DI_USER_REPOSITORY, useClass: UserRepository},
  ],
})
export class AppModule {}
