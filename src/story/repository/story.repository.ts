import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Collections } from 'src/collections';
import { AbstractRepository } from 'src/common';
import { StoryDocument } from '../models';

@Injectable()
export class StoryRepository extends AbstractRepository<StoryDocument> {
  constructor(
    @InjectModel(Collections.story)
    private readonly StoryModel: Model<StoryDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(StoryModel, connection);
  }
}
