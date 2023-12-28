import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { HttpLoggerMiddleware } from './common/http-logger.middleware';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { FamilyService } from './family/services/family.service';
import { FamilyController } from './family/controllers/family.controller';
import { FamilyModule } from './family/family.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    AuthModule,
    UserModule,
    DatabaseModule,
    FamilyModule,
    FirebaseModule,
  ],
  controllers: [AppController, FamilyController],
  providers: [AppService, FamilyService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
