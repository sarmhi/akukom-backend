import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Collections } from 'src/collections';
import { AbstractRepository } from 'src/common';
import { StoryCommentRepliesDocument } from '../models';

@Injectable()
export class StoryCommentRepliesRepository extends AbstractRepository<StoryCommentRepliesDocument> {
  constructor(
    @InjectModel(Collections.story_comments_replies)
    private readonly StoryCommentRepliesModel: Model<StoryCommentRepliesDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(StoryCommentRepliesModel, connection);
  }
}
