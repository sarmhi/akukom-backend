import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger: Logger = new Logger(HttpLoggerMiddleware.name);
  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', () => {
      const { method, originalUrl } = request;
      const { statusCode, statusMessage } = response;
      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage}`;

      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400 && statusCode < 500) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });
    next();
  }
}
