import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SeedService } from './common/seed/seed.service';
import * as dotenv from 'dotenv';

dotenv.config();

function validateEnvironment(): void {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET não configurado nas variáveis de ambiente. ' +
        'Defina JWT_SECRET no arquivo .env ou nas variáveis de ambiente do sistema.',
    );
  }
}

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
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

  const seedService = app.get(SeedService);
  await seedService.seed();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
