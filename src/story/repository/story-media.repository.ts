import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Collections } from 'src/collections';
import { AbstractRepository } from 'src/common';
import { StoryMediaDocument } from '../models';

@Injectable()
export class StoryMediaRepository extends AbstractRepository<StoryMediaDocument> {
  constructor(
    @InjectModel(Collections.story_media)
    private readonly StoryMediaModel: Model<StoryMediaDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(StoryMediaModel, connection);
  }
}
