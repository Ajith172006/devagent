import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const resBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Extract detailed message
    const errorDetails = typeof resBody === 'string' ? { message: resBody } : (resBody as any);
    const message = errorDetails.message || errorDetails || 'Internal server error';

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      error: errorDetails.error || (status === 500 ? 'Internal Server Error' : 'Error'),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Structured logging
    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`,
      stack,
    );

    response.status(status).json(errorResponse);
  }
}
