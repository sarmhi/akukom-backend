import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CompleteSignupDto,
  UserSignUpDto,
  VerifyPhoneNumberDto,
} from './dtos/signup.dto';
import { IResponse, IUser } from 'src/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcryptjs';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   * @param body UserSignupDto
   * @returns Promise of a successful signup
   */
  async signUp(body: UserSignUpDto): Promise<IResponse<any>> {
    this.logger.debug('Executing Signup Method');
    const { email, confirmPassword, password } = body;

    if (confirmPassword !== password)
      throw new ForbiddenException(
        'Password and confirmPassword fields must match',
      );

    //Check if user already exists in the database
    const foundUser = await this.userService.findUserbyEmail(email);

    if (foundUser)
      throw new ForbiddenException(
        `User already exists. Please login to continue`,
      );

    const createdUser = await this.userService.createUser({ ...body });

    const { accessToken, refreshToken } =
      await this.tokenService.handleCreateTokens(createdUser.id);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Sign up successful',
      data: {
        user: createdUser,
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   *
   * @param user authenticated user
   * @param phone authenticated user
   * @returns Promise of a successful signup
   */
  async checkPhoneUsage(phone: string): Promise<IResponse<any>> {
    const foundUserWithPhoneNumber = await this.userService.findUserbyPhone(
      phone,
    );

    if (foundUserWithPhoneNumber)
      throw new ForbiddenException(
        'Phone number is already in use by another user.',
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Phone number is not in use',
    };
  }

  /**
   *
   * @param body CompleteSignupDto
   *  @param user authenticated user
   * @returns Promise of a successful signup
   */
  async completeSignup(
    body: CompleteSignupDto,
    user: IUser,
  ): Promise<IResponse<any>> {
    this.logger.debug('Executing CompleteSignup Method');
    const { phone } = body;

    const foundUserWithPhoneNumber = await this.userService.findUserbyPhone(
      phone,
    );

    if (foundUserWithPhoneNumber)
      throw new ForbiddenException(
        'Phone number is already in use by another user.',
      );

    if (user.hasVerifiedPhone)
      throw new ForbiddenException(
        'A verified phone number is already attcahed to this user account',
      );

    const updatedUserInDb = await this.userService.updateUser(user.id, {
      ...body,
    });
    if (!updatedUserInDb)
      throw new InternalServerErrorException('Something went wrong');

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully completed signup process',
      data: updatedUserInDb,
    };
  }

  /**
   *
   * @param user authenticated user
   * @param phone authenticated user
   * @returns Promise of a successful signup
   */
  async verifyPhoneNumber(
    body: VerifyPhoneNumberDto,
    user: IUser,
  ): Promise<IResponse<any>> {
    const { code } = body;

    if (code !== '1234')
      throw new BadRequestException('Invalid verification code');

    const updatedUserInDb = await this.userService.updateUser(user.id, {
      hasVerifiedPhone: true,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully verified phone number',
      data: updatedUserInDb,
    };
  }

  /**
   * It takes in a phone number and password, checks if the user exists, if the user exists, it checks if
   * the password is valid, if the password is valid, it creates a new access token and refresh token and
   * returns them
   * @param {LoginDto} body - LoginDto
   * @returns A promise of a promise of a RequestResponse<LoginResponse>
   */
  async login(body: LoginDto) {
    const { phone, password } = body;

    const userInDb = await this.userService.findUserbyPhone(phone);
    if (!userInDb) throw new NotFoundException(`User not found`);

    const passwordsMatch = await bcrypt.compare(password, userInDb.password);
    if (!passwordsMatch) throw new BadRequestException(`Invalid password`);

    const { accessToken, refreshToken } =
      await this.tokenService.handleCreateTokens(userInDb.id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: {
        user: userInDb,
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * @description - Refreshes the expired token
   * @param token - The refresh token of the user
   * @returns - The new access token and refresh token
   */
  async refreshToken(token: string) {
    const { userId } = await this.jwtService.verify(token);
    if (!userId) throw new UnauthorizedException('Token Expired');
    const { accessToken, refreshToken } =
      await this.tokenService.handleCreateTokens(userId);
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}
