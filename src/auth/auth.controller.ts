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
import { AuthService } from './auth.service';
import {
  CompleteSignupDto,
  UserSignUpDto,
  VerifyPhoneNumberDto,
} from './dtos/signup.dto';
import { AuthenticatedUser, IUser, JwtUserAuthGuard } from 'src/common';
import { LoginDto } from './dtos/login.dto';

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

  @Post('process/refresh-token')
  @ApiOperation({ summary: 'Refresh token on access token expiration' })
  async handleRefreshToken(@Query('token') token: string) {
    return this.authService.refreshToken(token);
  }
}
