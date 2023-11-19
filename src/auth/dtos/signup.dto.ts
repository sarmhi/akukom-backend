import {
  IsEmail,
  IsNotEmpty,
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

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;
}

export class CompleteSignupDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}

export class VerifyPhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
