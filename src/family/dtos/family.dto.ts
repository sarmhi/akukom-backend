import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateFamilyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: Express.Multer.File;
}

export class EditFamilyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file?: Express.Multer.File;

  @IsMongoId()
  @IsString()
  familyId: string;
}

export class AddFamilyMembers {
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  usersToAdd: ObjectId[];

  @IsMongoId()
  @IsString()
  familyId: string;
}
