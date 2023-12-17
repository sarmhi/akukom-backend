import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { AuthController, ProfileController } from './controllers';
import { AuthService, ProfileService, TokenService } from './services';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
    CommonModule,
  ],
  providers: [AuthService, TokenService, ProfileService],
  controllers: [AuthController, ProfileController],
  exports: [TokenService, AuthService, ProfileService],
})
export class AuthModule {}
