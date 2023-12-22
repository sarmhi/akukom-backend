import { Module } from '@nestjs/common';
import { FamilyController } from './controllers/family.controller';
import { FamilyService } from './services/family.service';
import { UserModule } from 'src/user/user.module';
import { CommonModule } from 'src/common/common.module';
import { familyModuleCollections } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyRepository } from './repository';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature(familyModuleCollections),
    UserModule,
  ],
  controllers: [FamilyController],
  providers: [FamilyService, FamilyRepository],
  exports: [FamilyService, FamilyRepository],
})
export class FamilyModule {}
