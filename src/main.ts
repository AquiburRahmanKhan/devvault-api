import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown fields
      forbidNonWhitelisted: true, // error on unknown fields
      transform: true, // transforms payloads into DTO instances
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
