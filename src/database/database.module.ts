import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('NODE_ENV') === 'development'
            ? configService.get<string>('MONGO_URI_DEV')
            : configService.get<string>('NODE_ENV') === 'staging'
            ? configService.get<string>('MONGO_URI_STAGING')
            : configService.get<string>('NODE_ENV') === 'production'
            ? configService.get<string>('MONGO_URI_PROD')
            : configService.get<string>('MONGO_URI_TEST'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
