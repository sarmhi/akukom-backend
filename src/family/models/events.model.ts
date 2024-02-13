import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { UserDocument } from '../../user/models/user.model';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Collections } from 'src/collections';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FamilyDocument } from './family.model';

export type EventDocument = HydratedDocument<Event>;

@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Event {
  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'The Okafors',
    description: 'Name of the Event',
  })
  name: string;

  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Story media',
  })
  coverImageUrl?: string;

  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'key used to save media in the bucket',
  })
  coverImageKey?: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Lekki',
    description: 'Location of the Event',
  })
  location?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.users,
  })
  creator: UserDocument;

  @Prop({
    type: Date,
  })
  @IsOptional()
  startDate?: Date;

  @Prop({
    type: Date,
  })
  @IsOptional()
  stopDate?: Date;

  @Prop({
    default: [],
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Collections.users,
      },
    ],
  })
  guests: (string | ObjectId | UserDocument)[] = [];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.family,
  })
  family: string | ObjectId | FamilyDocument;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.plugin(mongoosePaginate);
