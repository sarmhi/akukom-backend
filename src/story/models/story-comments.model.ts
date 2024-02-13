import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Collections } from 'src/collections';
import { UserDocument } from 'src/user';
import { StoryCommentRepliesDocument } from './story-comments-replies.model';

export type StoryCommentDocument = HydratedDocument<StoryComment>;

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
export class StoryComment {
  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Story Comment',
  })
  comment?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.users,
  })
  commentor: UserDocument;

  @Prop({
    default: [],
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Collections.story_comments_replies,
      },
    ],
  })
  replies: (string | ObjectId | StoryCommentRepliesDocument)[];
}

export const StoryCommentSchema = SchemaFactory.createForClass(StoryComment);
StoryCommentSchema.plugin(mongoosePaginate);
