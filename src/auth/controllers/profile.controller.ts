import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfileService } from '../services';
import { AuthenticatedUser, IUser, JwtUserAuthGuard } from 'src/common';
import { ChangePasswordDto, EditProfileDto } from '../dtos';

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
}
