import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../domain/entity';
import { UserRepository } from '../repository/user.repository';
import { DI_USER_REPOSITORY } from '../../config/container-names.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'bank-transactions-user'),
        password: configService.get('DB_PASSWORD', 'bank-transactions-password'),
        database: configService.get('DB_DATABASE', 'bank-transactions-database'),
        entities: [User],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    UserRepository,
    {
      provide: DI_USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [TypeOrmModule, DI_USER_REPOSITORY],
})
export class DatabaseModule {}
