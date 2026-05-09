import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const responseBody = res as { message?: string | string[] };
        message =
          (Array.isArray(responseBody.message)
            ? responseBody.message.join('; ')
            : responseBody.message) || message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    }

    // Normaliza a mensagem para string (pode vir como array em erros de validação)
    const normalizedMessage = Array.isArray(message)
      ? message.join('; ')
      : message;

    response.status(status).json({
      statusCode: status,
      message: normalizedMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
