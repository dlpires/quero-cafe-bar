import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => {
          if (err.constraints) {
            return `${err.property}: ${Object.values(err.constraints).join(', ')}`;
          }
          if (err.children?.length) {
            return `${err.property}: ${err.children.map((child) => (child.constraints ? Object.values(child.constraints).join(', ') : 'erro de validação')).join('; ')}`;
          }
          return `${err.property}: erro de validação`;
        });
        return new BadRequestException(
          `Dados inválidos: ${messages.join('; ')}`,
        );
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
