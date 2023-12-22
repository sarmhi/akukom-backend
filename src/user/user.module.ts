import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userModuleCollections } from './config';
import { UserRepository } from './repository';

@Module({
  imports: [MongooseModule.forFeature(userModuleCollections)],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
