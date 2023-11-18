import { Module } from '@nestjs/common';
import { HttpLoggerMiddleware } from './http-logger.middleware';

@Module({
  exports: [HttpLoggerMiddleware],
  imports: [],
  controllers: [],
  providers: [HttpLoggerMiddleware],
})
export class CommonModule {}
