import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { storyModuleCollections } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from 'src/common/common.module';
import {
  StoryCommentRepliesRepository,
  StoryCommentRepository,
  StoryMediaRepository,
  StoryRepository,
} from './repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature(storyModuleCollections),
    UserModule,
  ],
  controllers: [StoryController],
  providers: [
    StoryService,
    StoryRepository,
    StoryCommentRepliesRepository,
    StoryCommentRepository,
    StoryMediaRepository,
  ],
  exports: [
    StoryService,
    StoryRepository,
    StoryCommentRepliesRepository,
    StoryCommentRepository,
    StoryMediaRepository,
  ],
})
export class StoryModule {}
