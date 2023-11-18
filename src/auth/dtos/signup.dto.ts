import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export enum REGISTRATION_TYPE {
  withPhone = 'phone',
  withEmail = 'eamil',
}

export class UserSignUpDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  phone: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;

  @IsOptional()
  @IsString()
  address?: string;
}
