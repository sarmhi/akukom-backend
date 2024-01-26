import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export type StoryMediaDocument = HydratedDocument<StoryMedia>;
export enum MediaType {
  video = 'video',
  image = 'image',
}

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
export class StoryMedia {
  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Story media',
  })
  mediaUrl?: string;

  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'key used to save media in the bucket',
  })
  mediaKey?: string;

  // @Prop({ type: String, default: MediaType.image })
  // @IsNotEmpty()
  // @IsEnum(MediaType)
  // @ApiProperty({
  //   type: String,
  //   example: MediaType.image,
  // })
  // mediaType: MediaType;
}

export const StoryMediaSchema = SchemaFactory.createForClass(StoryMedia);
StoryMediaSchema.plugin(mongoosePaginate);
