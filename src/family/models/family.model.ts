import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { UserDocument } from '../../user/models/user.model';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Collections } from 'src/collections';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type FamilyDocument = HydratedDocument<Family>;

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
export class Family {
  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'The Okafors',
    description: 'Name of the family',
  })
  name: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Familys Image',
  })
  image?: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'key used to save image in the bucket',
  })
  imageKey?: string;

  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example:
      'We are here to have laughs and chat with one another while sending pictures to one another. It’s so lovely to have everyone hereee! Let’s go!',
    description: 'Description of the family',
  })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.users,
  })
  creator: UserDocument;

  @Prop({
    default: [],
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Collections.request,
      },
    ],
  })
  pendingRequests?: (string | ObjectId | Request)[] = [];

  @Prop({
    default: [],
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Collections.users,
      },
    ],
  })
  members: (string | ObjectId | UserDocument)[] = [];
}

export const FamilySchema = SchemaFactory.createForClass(Family);
FamilySchema.plugin(mongoosePaginate);
