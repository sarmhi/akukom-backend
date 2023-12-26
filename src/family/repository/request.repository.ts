import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Collections } from 'src/collections';
import { AbstractRepository } from 'src/common';
import { RequestDocument } from '../models';

@Injectable()
export class RequestRepository extends AbstractRepository<RequestDocument> {
  constructor(
    @InjectModel(Collections.request)
    private readonly RequestModel: Model<RequestDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(RequestModel, connection);
  }
}
