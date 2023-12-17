import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsEmail,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as bcrypt from 'bcryptjs';
import { Status } from 'src/common';

export type UserDocument = HydratedDocument<User>;

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
export class User {
  @Prop({ type: String, lowercase: true })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'John',
    description: 'first name of user',
  })
  firstName?: string;

  @Prop({ type: String, lowercase: true })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Micheal',
    description: 'Last name of user',
  })
  lastName?: string;

  @Prop({ type: String, unique: true, sparse: true })
  @IsOptional()
  @IsEmail()
  @IsString()
  @ApiProperty({ type: String, example: 'test@yahoo.com' })
  email?: string;

  @Prop({ type: Boolean, default: false })
  @IsNotEmpty()
  @IsBoolean()
  hasVerifiedEmail: boolean;

  @Prop({ unique: true, sparse: true })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid with + sign',
  })
  @ApiProperty({ type: String, example: '+639171234567' })
  phone?: string;

  @Prop({ type: Boolean, default: false })
  @IsNotEmpty()
  @IsBoolean()
  hasVerifiedPhone: boolean;

  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @ApiProperty({
    type: String,
    minLength: 8,
    description: 'User password',
  })
  password: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Users Country of Residence',
  })
  country?: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Users tribe',
  })
  tribe?: string;

  @Prop({ type: String, default: Status.ACTIVE })
  @IsNotEmpty()
  @IsEnum(Status)
  @ApiProperty({
    type: Status,
    description: 'Account status',
  })
  status: Status;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongoosePaginate);
UserSchema.pre<UserDocument>('save', async function (next) {
  const user = this as UserDocument;
  if (!user.isModified('password')) return next();
  const salt = await bcrypt.genSalt(
    10,
    // Number(config.get<string>('BCRYPT_HASH_SALT_ROUNDS')),
  );
  user.password = await bcrypt.hash(user.password, salt);
  next();
});
