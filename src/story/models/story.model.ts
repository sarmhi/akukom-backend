import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Collections } from 'src/collections';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StoryMediaDocument } from './story-media.model';
import { StoryCommentDocument } from './story-comments.model';
import { UserDocument } from 'src/user';

export type StoryDocument = HydratedDocument<Story>;

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
export class Story {
  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'The Okafors',
    description: 'Name of the family',
  })
  title: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example:
      'We are here to have laughs and chat with one another while sending pictures to one another. It’s so lovely to have everyone hereee! Let’s go!',
    description: 'Description of the family',
  })
  description?: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Badagry',
    description: 'Location where story took or is taking place',
  })
  location?: string;

  @Prop({
    type: Date,
  })
  @IsOptional()
  date?: Date;

  @Prop({
    default: [],
    type: [
      { type: mongoose.Schema.Types.ObjectId, ref: Collections.story_media },
    ],
  })
  media: (string | ObjectId | StoryMediaDocument)[];

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
        ref: Collections.story_comments,
      },
    ],
  })
  comments: (string | ObjectId | StoryCommentDocument)[];

  @Prop({
    default: [],
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Collections.users,
      },
    ],
  })
  taggedUsers: (string | ObjectId | UserDocument)[];

  @Prop({
    default: [],
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Collections.users,
      },
    ],
  })
  storyBuddies: (string | ObjectId | UserDocument)[];
}

export const StorySchema = SchemaFactory.createForClass(Story);
StorySchema.plugin(mongoosePaginate);
