import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Collections } from 'src/collections';
import { UserDocument } from 'src/user';

export type StoryCommentRepliesDocument = HydratedDocument<StoryCommentReplies>;

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
export class StoryCommentReplies {
  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Story comment replies',
  })
  comment?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.users,
  })
  commentor: UserDocument;
}

export const StoryCommentRepliesSchema =
  SchemaFactory.createForClass(StoryCommentReplies);
StoryCommentRepliesSchema.plugin(mongoosePaginate);
