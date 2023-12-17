import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class CheckEmailUsageDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}

export class EditProfileDto {
  @IsOptional()
  @IsEmail()
  @IsString()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  phone: string;

  @IsOptional()
  @IsString()
  country: string;
}
