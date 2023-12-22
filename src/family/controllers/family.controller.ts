import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtUserAuthGuard } from 'src/common/guards/user/jwt.guard';
import { FamilyService } from '../services';
import {
  AddFamilyMembers,
  CreateFamilyDto,
  EditFamilyDto,
} from '../dtos/family.dto';
import { AuthenticatedUser, IUser } from 'src/common';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Family')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'family',
})
@UseGuards(JwtUserAuthGuard)
@Controller('family')
export class FamilyController {
  private readonly logger: Logger = new Logger(FamilyController.name);
  constructor(private readonly familyService: FamilyService) {}

  @Post('create-family')
  @ApiOperation({
    summary: 'Creates a users family',
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
        fileSize: Math.pow(1024, 6),
      },
    }),
  )
  @ApiConsumes('multipart/form-data', 'json')
  async createFamily(
    @Body() body: CreateFamilyDto,
    @AuthenticatedUser() user: IUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.familyService.createFamily(body, user, file);
  }

  @Get('user-in-family/:userId/:familyId')
  @ApiOperation({
    summary: `Checks if a user(userId) is a member of any of the loggedin user's families`,
  })
  async checkUserInFamily(
    @Param('userId') userId: string,
    @Param('familyId') familyId: string,
    @AuthenticatedUser() user: IUser,
  ) {
    return this.familyService.checkUserInFamily(userId, familyId, user);
  }

  @Post('update-family-details')
  @ApiOperation({
    summary: `Edits a family's details`,
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
        fileSize: Math.pow(1024, 6),
      },
    }),
  )
  @ApiConsumes('multipart/form-data', 'json')
  async editFamilyDetails(
    @Body() body: EditFamilyDto,
    @AuthenticatedUser() user: IUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.familyService.editFamilyDetails(body, user, file);
  }

  @Post('add-family-members')
  @ApiOperation({
    summary: `Used to add members to a family`,
  })
  async addFamilyMembers(
    @Body() body: AddFamilyMembers,
    @AuthenticatedUser() user: IUser,
  ) {
    return this.familyService.addFamilyMembers(body, user);
  }

  @Get('list-pending-family-invitations')
  @ApiOperation({
    summary: `Used to get a user's pending invitations to a family`,
  })
  async getPendingFamilyInvitations(@AuthenticatedUser() user: IUser) {
    return this.familyService.getPendingFamilyInvitations(user);
  }
}
