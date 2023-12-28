import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Collections } from 'src/collections';
import { AbstractRepository } from 'src/common';
import { FamilyDocument } from '../models';

@Injectable()
export class FamilyRepository extends AbstractRepository<FamilyDocument> {
  constructor(
    @InjectModel(Collections.family)
    private readonly familyModel: Model<FamilyDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(familyModel, connection);
  }
}
