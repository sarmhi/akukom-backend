import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import {
  CompleteSignupDto,
  UserSignUpDto,
  VerifyPhoneNumberDto,
} from '../dtos/signup.dto';
import { AuthenticatedUser, IUser } from 'src/common';
import { LoginDto } from '../dtos/login.dto';
import {
  ChangeUserPasswordDto,
  ProcessForgetPasswordOtpDto,
  ProcessForgetPasswordOtpVerificationDto,
} from '../dtos/account-recovery.dto';
import { CheckEmailUsageDto } from '../dtos';
import { JwtUserAuthGuard } from 'src/common/guards/user/jwt.guard';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'auth',
})
@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('process/signup')
  @ApiOperation({
    summary: 'Signs a new user up',
  })
  async signup(@Body() body: UserSignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('process/login')
  @ApiOperation({ summary: `Logs in a user` })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('process/check-phone-usage')
  @UseGuards(JwtUserAuthGuard)
  @ApiOperation({ summary: `Checks if a phone number has already been used` })
  async checkPhoneUsage(@Query('phone') phone: string) {
    return this.authService.checkPhoneUsage(phone);
  }

  @Post('process/complete-signup')
  @UseGuards(JwtUserAuthGuard)
  @ApiOperation({
    summary: 'Completes a users signup process',
    description: `Collects remaining users informtion like phone, country and tribe`,
  })
  async completeSignup(
    @Body() body: CompleteSignupDto,
    @AuthenticatedUser() user: IUser,
  ) {
    return this.authService.completeSignup(body, user);
  }

  @Post('process/verify-phone-number')
  @UseGuards(JwtUserAuthGuard)
  @ApiOperation({ summary: `Verifies a phone number is valid` })
  async verifyPhoneNumber(
    @Body() body: VerifyPhoneNumberDto,
    @AuthenticatedUser() user: IUser,
  ) {
    return this.authService.verifyPhoneNumber(body, user);
  }

  @Post('process/forgot-password-otp')
  @ApiOperation({ summary: `Initiates the otp token to reset the password` })
  async processForgetPasswordOtp(@Body() body: ProcessForgetPasswordOtpDto) {
    return this.authService.processForgetPasswordOtp(body);
  }

  @Post('process/forgot-password-otp-verification')
  @ApiOperation({
    summary: `Verifies the token sent to users email and changes password`,
  })
  async processForgetPasswordOtpVerification(
    @Body() body: ProcessForgetPasswordOtpVerificationDto,
  ) {
    return this.authService.processForgetPasswordOtpVerification(body);
  }

  @Post('process/change-password')
  @ApiOperation({
    summary: `Changes users password after otp verification`,
  })
  async changeUserPassword(@Body() body: ChangeUserPasswordDto) {
    return this.authService.changeUserPassword(body);
  }

  @Post('process/refresh-token')
  @ApiOperation({ summary: 'Refresh token on access token expiration' })
  async handleRefreshToken(@Query('token') token: string) {
    return this.authService.refreshToken(token);
  }

  @Get('process/check-email-usage')
  @ApiOperation({
    summary: `Used to check if an email is already in use`,
  })
  async checkEmailUsage(@Body() body: CheckEmailUsageDto) {
    return this.authService.checkEmailUsage(body);
  }
}
