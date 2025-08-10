import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './adapter/controller/clients.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './adapter/database/database.module';
import { RepositoryModule } from './adapter/repository/repository.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    RepositoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
