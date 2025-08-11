import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Enable CORS if needed
    app.enableCors();

    const config = new DocumentBuilder()
    .setTitle('Project Bank - Transactions API')
    .setDescription('API for managing bank transactions')
    .setVersion('1.0')
    .addTag('transactions')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.TRANSACTIONS_SERVICE_PORT || process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
