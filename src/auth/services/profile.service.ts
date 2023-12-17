import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IUser, ResponseMessage, Status } from 'src/common';
import { UserService } from 'src/user/user.service';
import { ChangePasswordDto, EditProfileDto } from '../dtos';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfileService {
  private logger: Logger = new Logger(ProfileService.name);

  constructor(private readonly userService: UserService) {}

  async deactivateAccount(user: IUser) {
    const foundUserInDb = await this.userService.findUserById(user.id);
    if (!foundUserInDb)
      throw new NotFoundException(`User with id ${user.id} not found`);

    foundUserInDb.status = Status.DEACTIVATED;

    const updatedUserInDb = await foundUserInDb.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedUserInDb,
    };
  }

  async deleteAccount(user: IUser) {
    const foundUserInDb = await this.userService.findUserById(user.id);
    if (!foundUserInDb)
      throw new NotFoundException(`User with id ${user.id} not found`);

    // Todo: Remove all contemt belonging to this user from our database

    await foundUserInDb.deleteOne();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async changePassword(body: ChangePasswordDto, user: IUser) {
    const { currentPassword, newPassword } = body;
    const foundUserInDb = await this.userService.findUserById(user.id);
    if (!foundUserInDb)
      throw new NotFoundException(`User with id ${user.id} not found`);

    const isMatch = await this.checkPassword(
      currentPassword,
      foundUserInDb.password,
    );
    if (!isMatch) throw new BadRequestException('Old password is incorrect');
    foundUserInDb.password = newPassword;

    await foundUserInDb.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async editProfile(body: EditProfileDto, user: IUser) {
    const { country, email, phone } = body;
    const foundUserInDb = await this.userService.findUserById(user.id);
    if (!foundUserInDb)
      throw new NotFoundException(`User with id ${user.id} not found`);

    if (email) {
      const foundAccountUsingEmail = await this.userService.findUserbyEmail(
        email,
      );
      if (foundAccountUsingEmail)
        throw new ConflictException(
          `User with email ${foundAccountUsingEmail.email} already exists`,
        );

      foundUserInDb.email = email;
      foundUserInDb.hasVerifiedEmail = false;
    }

    if (phone) {
      const foundUserWithPhoneNumber = await this.userService.findUserbyPhone(
        phone,
      );

      if (foundUserWithPhoneNumber)
        throw new ConflictException(
          'Phone number is already in use by another user.',
        );

      foundUserInDb.phone = phone;
      foundUserInDb.hasVerifiedPhone = false;
    }

    if (country) {
      foundUserInDb.country = country;
    }

    const updatedUserInDb = await foundUserInDb.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedUserInDb,
    };
  }

  private async checkPassword(
    password1: string,
    password2: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password1, password2);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
