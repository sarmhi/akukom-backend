import {
  ArrayMinSize,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateStoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDate()
  @IsOptional()
  date?: Date;
}

export class TagUsersToStoryDto {
  @IsMongoId()
  @IsString()
  storyId: string;

  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  usersToTag: ObjectId[];
}

export class AddStoryBuddies {
  @IsMongoId()
  @IsString()
  storyId: string;

  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  usersToAdd: ObjectId[];
}
