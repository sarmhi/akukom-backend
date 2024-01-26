import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';

export class CreateFamilyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file?: Express.Multer.File;
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
  @IsNotEmpty()
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

export class GetFamilyList {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  familyId: string;
}

export class AcceptPendingRequest {
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false;
  })
  accepted: boolean;

  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  requestId: string;
}

export class CreateFamilyEvent {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  stopDate?: Date;

  @ApiProperty({ type: 'string', format: 'binary' })
  file?: Express.Multer.File;
}

export class InviteEventGuests {
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  attendees?: ObjectId[];
}
