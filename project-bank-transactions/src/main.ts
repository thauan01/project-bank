import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Enable CORS if needed
    app.enableCors();

    const config = new DocumentBuilder()
    .setTitle('URL_Shortener API')
    .setDescription('Greater shortener and management of URLs')
    .setVersion('1.0')
    .addTag('endpoints') // opcional
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
