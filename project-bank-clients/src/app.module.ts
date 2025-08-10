import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './adapter/controller/clients.controller';
import { DatabaseModule } from './adapter/database/database.module';
import { ClientsService } from './domain/service/clients.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [ClientsService],
})
export class AppModule {}
