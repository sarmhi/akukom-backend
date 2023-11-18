import { Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/abstract.repository';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { UserDocument } from '../models/user.model';
import { Collections } from 'src/collections';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
  constructor(
    @InjectModel(Collections.users)
    private readonly userModel: Model<UserDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }
}
