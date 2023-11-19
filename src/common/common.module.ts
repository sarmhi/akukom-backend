import { Module } from '@nestjs/common';
import { HttpLoggerMiddleware } from './http-logger.middleware';
import { JwtUserAuthGuard, JwtUserPassportStrategy } from './guards';
import { UserModule } from 'src/user/user.module';

@Module({
  exports: [HttpLoggerMiddleware, JwtUserPassportStrategy, JwtUserAuthGuard],
  imports: [UserModule],
  controllers: [],
  providers: [HttpLoggerMiddleware, JwtUserPassportStrategy, JwtUserAuthGuard],
})
export class CommonModule {}
