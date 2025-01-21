import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { MyLoggerService } from './my-logger/my-logger.service';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

type ResponseObject = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const resObj: ResponseObject = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    if (exception instanceof HttpException) {
      resObj.statusCode = exception.getStatus();
      resObj.response = exception.getResponse();
    } else if (exception instanceof PrismaClientValidationError) {
      resObj.statusCode = 422;
      resObj.response = exception.message.replaceAll(/\n/g, ' ');
    } else {
      resObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      resObj.response = 'Internal server error';
    }

    response.status(resObj.statusCode).json(resObj);
    this.logger.error(resObj.response, AllExceptionsFilter.name);

    super.catch(exception, host);
  }
}
