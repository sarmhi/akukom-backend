import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class LoginDto {
  @IsPhoneNumber()
  @IsOptional()
  phone: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
