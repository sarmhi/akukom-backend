import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { ProfileService } from '../services';
import { AuthenticatedUser, FindManyDto, IUser } from 'src/common';
import { ChangePasswordDto, EditProfileDto } from '../dtos';
import { JwtUserAuthGuard } from 'src/common/guards/user/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'profile',
})
@UseGuards(JwtUserAuthGuard)
@Controller('profile')
export class ProfileController {
  private readonly logger: Logger = new Logger(ProfileController.name);
  constructor(private readonly profileService: ProfileService) {}

  @Post('deactivate-account')
  @ApiOperation({
    summary: `Deactivates a user's account`,
  })
  async deactivateAccount(@AuthenticatedUser() user: IUser) {
    return this.profileService.deactivateAccount(user);
  }

  @Post('delete-account')
  @ApiOperation({
    summary: `Deletes a user's account`,
  })
  async deleteAccount(@AuthenticatedUser() user: IUser) {
    return this.profileService.deleteAccount(user);
  }

  @Post('change-password')
  @ApiOperation({
    summary: `Used to change a user's password`,
  })
  async changePassword(
    @Body() body: ChangePasswordDto,
    @AuthenticatedUser() user: IUser,
  ) {
    return this.profileService.changePassword(body, user);
  }

  @Post('edit-user-profile')
  @ApiOperation({
    summary: `Used to edit a user's profile`,
  })
  async editProfile(
    @Body() body: EditProfileDto,
    @AuthenticatedUser() user: IUser,
  ) {
    return this.profileService.editProfile(body, user);
  }

  @Post('edit-profile-image')
  @ApiOperation({
    summary: `Used to edit a user's profile image`,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req: Request, file, callback) => {
        if (
          !file.mimetype.includes('jpg') &&
          !file.mimetype.includes('jpeg') &&
          !file.mimetype.includes('png')
        ) {
          return callback(
            new BadRequestException('Image must be of type jpg, jpeg or png'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 6), //3mb
      },
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  async editProfileImage(
    @AuthenticatedUser() user: IUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.editProfileImage(file, user);
  }

  @Post('get-users')
  @ApiOperation({
    summary: `Gets a list of users on the platform`,
  })
  getUsers(@Query() query: FindManyDto) {
    return this.profileService.getUsers(query);
  }
}
