import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
