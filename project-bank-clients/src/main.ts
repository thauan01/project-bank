import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getRabbitMQConfig } from './config/rabbitmq.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Cria a aplicação HTTP principal
  const app = await NestFactory.create(AppModule);

  // Configura o Swagger
  const config = new DocumentBuilder()
    .setTitle('Project Bank - Clients API')
    .setDescription('API for managing bank clients')
    .setVersion('1.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configura o microservice RabbitMQ
  const microservice = app.connectMicroservice(getRabbitMQConfig());
  
  // Inicia o microservice
  await app.startAllMicroservices();
  logger.log('RabbitMQ microservice started successfully');

  // Inicia a aplicação HTTP
  const port = process.env.CLIENTS_SERVICE_PORT || 3001;
  await app.listen(port);
  logger.log(`HTTP server running on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();
