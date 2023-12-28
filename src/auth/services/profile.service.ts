import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileService, FindManyDto, ResponseMessage, Status } from 'src/common';
import { ChangePasswordDto, EditProfileDto } from '../dtos';
import * as bcrypt from 'bcryptjs';
import { UserDocument, UserRepository, UserService } from 'src/user';

@Injectable()
export class ProfileService {
  private logger: Logger = new Logger(ProfileService.name);

  constructor(
    private readonly userService: UserService,
    private readonly userRepo: UserRepository,
    private readonly fileService: FileService,
  ) {}

  async deactivateAccount(user: UserDocument) {
    user.status = Status.DEACTIVATED;

    const updatedUserInDb = await user.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedUserInDb,
    };
  }

  async deleteAccount(user: UserDocument) {
    // Todo: Remove all content belonging to this user from our database

    await user.deleteOne();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async changePassword(body: ChangePasswordDto, user: UserDocument) {
    const { currentPassword, newPassword } = body;

    const isMatch = await this.checkPassword(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');
    user.password = newPassword;

    await user.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async editProfile(body: EditProfileDto, user: UserDocument) {
    const { country, email, phone } = body;

    if (email) {
      const foundAccountUsingEmail = await this.userService.findUserbyEmail(
        email,
      );
      if (foundAccountUsingEmail)
        throw new ConflictException(
          `User with email ${foundAccountUsingEmail.email} already exists`,
        );

      user.email = email;
      user.hasVerifiedEmail = false;
    }

    if (phone) {
      const foundUserWithPhoneNumber = await this.userService.findUserbyPhone(
        phone,
      );

      if (foundUserWithPhoneNumber)
        throw new ConflictException(
          'Phone number is already in use by another user.',
        );

      user.phone = phone;
      user.hasVerifiedPhone = false;
    }

    if (country) {
      user.country = country;
    }

    const updatedUserInDb = await user.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedUserInDb,
    };
  }

  async editProfileImage(file: Express.Multer.File, user: UserDocument) {
    if (user.image) {
      const deleted = await this.fileService.deletePublicFile(user.imageKey);
      if (deleted) {
        user.image = null;
        user.imageKey = null;
      }
    }
    const { url, key } = await this.fileService.uploadPublicFile(
      file.buffer,
      `profile-image-${file.originalname}`,
      file.mimetype,
    );
    user.image = url;
    user.imageKey = key;
    const updatedUserInDb = await user.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedUserInDb,
    };
  }

  async getUsers(query: FindManyDto) {
    const { search } = query;
    const condition = {};
    if (search) {
      condition['$or'] = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const foundUsersInDb = await this.userRepo.findManyWithPagination(
      condition,
      query,
    );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: foundUsersInDb,
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
