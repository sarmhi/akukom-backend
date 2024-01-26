import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Collections } from 'src/collections';
import { AbstractRepository } from 'src/common';
import { StoryCommentDocument } from '../models';

@Injectable()
export class StoryCommentRepository extends AbstractRepository<StoryCommentDocument> {
  constructor(
    @InjectModel(Collections.story_comments)
    private readonly StoryCommentModel: Model<StoryCommentDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(StoryCommentModel, connection);
  }
}
