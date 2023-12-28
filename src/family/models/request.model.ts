import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { UserDocument } from '../../user/models/user.model';
import mongoose, { HydratedDocument } from 'mongoose';
import { Collections } from 'src/collections';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FamilyDocument } from './family.model';

export type RequestDocument = HydratedDocument<Request>;
export enum RequestType {
  USER_REQUEST = 'user_request',
  FAMILY_INVITATION = 'family_invitation',
}
export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
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
export class Request {
  @Prop({ type: String, default: RequestType.FAMILY_INVITATION })
  @IsNotEmpty()
  @IsEnum(RequestType)
  @ApiProperty({
    type: String,
    example: RequestType.FAMILY_INVITATION,
  })
  requestType: RequestType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.users,
  })
  user: UserDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.family,
  })
  family: FamilyDocument;

  @Prop({ type: String, default: RequestStatus.PENDING })
  @IsNotEmpty()
  @IsEnum(RequestStatus)
  @ApiProperty({
    type: String,
    example: RequestStatus.PENDING,
  })
  status: RequestStatus;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
RequestSchema.plugin(mongoosePaginate);
