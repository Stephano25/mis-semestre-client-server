import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // ⚠️ IMPORTANT : Commentez ou supprimez cette ligne
  // app.setGlobalPrefix('api');
  
  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API École de Formation')
    .setDescription('API REST pour la gestion d\'une plateforme de formation en ligne')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(process.env.PORT || 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT || 3000}`);
  console.log(`Swagger UI: http://localhost:${process.env.PORT || 3000}/api/docs`);
}
bootstrap();