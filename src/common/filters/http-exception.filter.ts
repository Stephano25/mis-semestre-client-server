import { ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.status || 500;

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as any;
      return response.status(422).json({
        success: false,
        message: 'Validation error',
        data: exceptionResponse.message || exceptionResponse,
      });
    }

    if (exception.status === 401) {
      return response.status(401).json({
        success: false,
        message: exception.message || 'Non autorisé',
      });
    }

    if (exception.status === 404) {
      return response.status(404).json({
        success: false,
        message: exception.message || 'Ressource non trouvée',
      });
    }

    if (exception.status === 409) {
      return response.status(409).json({
        success: false,
        message: exception.message,
      });
    }

    response.status(status).json({
      success: false,
      message: exception.message || 'Erreur interne',
      data: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
    });
  }
}