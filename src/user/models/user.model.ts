import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsEmail,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as bcrypt from 'bcryptjs';

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
  @Prop({ type: String, required: true, lowercase: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'John',
    description: 'first name of user',
  })
  firstName: string;

  @Prop({ type: String, required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Micheal',
    description: 'Last name of user',
  })
  lastName: string;

  @Prop({ type: String, unique: true })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Micchy',
    description: 'Username of user',
  })
  userName?: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: '15, Ajegunle Road, Ogbomosho, Lagos',
    description: 'address of user',
  })
  address?: string;

  @Prop({ type: String, unique: true })
  @IsOptional()
  @IsEmail()
  @IsString()
  @ApiProperty({ type: String, example: 'test@yahoo.com' })
  email: string;

  @Prop({ unique: true })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid with + sign',
  })
  @ApiProperty({ type: String, example: '+639171234567' })
  phone: string;

  @Prop({ type: String })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @ApiProperty({
    type: String,
    minLength: 5,
    description: 'User password',
  })
  password: string;
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
