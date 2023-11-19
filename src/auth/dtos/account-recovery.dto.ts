import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ProcessForgetPasswordOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}

export class ProcessForgetPasswordOtpVerificationDto extends ProcessForgetPasswordOtpDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ChangeUserPasswordDto extends ProcessForgetPasswordOtpDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}
