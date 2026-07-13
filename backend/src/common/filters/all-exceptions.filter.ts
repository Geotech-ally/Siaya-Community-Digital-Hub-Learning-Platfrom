import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

function getErrorMessage(exception: unknown): string {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    if (response && typeof response === 'object') {
      const body = response as { message?: string | string[]; error?: string };
      if (Array.isArray(body.message)) return body.message.join('; ');
      if (body.message) return body.message;
      if (body.error) return body.error;
    }
    return exception.message;
  }

  if (exception instanceof Error) return exception.message;
  return 'Internal server error';
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = getErrorMessage(exception);

    if (status >= 500) {
      console.error('[API_ERROR]', exception);
    }

    if (status >= 500) {
      response.status(status).json({ error });
      return;
    }

    response.status(status).json({
      statusCode: status,
      error,
      message: error,
      timestamp: new Date().toISOString(),
    });
  }
}
