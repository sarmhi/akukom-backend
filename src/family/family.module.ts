import { Module } from '@nestjs/common';
import { FamilyController } from './controllers/family.controller';
import { FamilyService } from './services/family.service';
import { UserModule } from 'src/user/user.module';
import { CommonModule } from 'src/common/common.module';
import { familyModuleCollections } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventRepository,
  FamilyRepository,
  RequestRepository,
} from './repository';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature(familyModuleCollections),
    UserModule,
  ],
  controllers: [FamilyController],
  providers: [
    FamilyService,
    FamilyRepository,
    RequestRepository,
    EventRepository,
  ],
  exports: [
    FamilyService,
    FamilyRepository,
    RequestRepository,
    EventRepository,
  ],
})
export class FamilyModule {}
