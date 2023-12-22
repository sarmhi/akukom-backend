import { Module } from '@nestjs/common';
import { HttpLoggerMiddleware } from './http-logger.middleware';
import { JwtUserAuthGuard, JwtUserPassportStrategy } from './guards';
import { UserModule } from 'src/user/user.module';
import { FileService, S3BucketService } from './services';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  exports: [
    HttpLoggerMiddleware,
    JwtUserPassportStrategy,
    JwtUserAuthGuard,
    S3BucketService,
    FileService,
  ],
  imports: [UserModule, FirebaseModule],
  controllers: [],
  providers: [
    HttpLoggerMiddleware,
    JwtUserPassportStrategy,
    JwtUserAuthGuard,
    S3BucketService,
    FileService,
  ],
})
export class CommonModule {}
