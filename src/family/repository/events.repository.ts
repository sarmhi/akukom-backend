import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Collections } from 'src/collections';
import { AbstractRepository } from 'src/common';
import { EventDocument } from '../models';

@Injectable()
export class EventRepository extends AbstractRepository<EventDocument> {
  constructor(
    @InjectModel(Collections.events)
    private readonly EventModel: Model<EventDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(EventModel, connection);
  }
}
