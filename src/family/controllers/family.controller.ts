import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
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
  AcceptPendingRequest,
  AddFamilyMembers,
  CreateFamilyDto,
  EditFamilyDto,
  GetFamilyList,
} from '../dtos/family.dto';
import { AuthenticatedUser, FindManyDto } from 'src/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDocument } from 'src/user';

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
    @AuthenticatedUser() user: UserDocument,
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
    @AuthenticatedUser() user: UserDocument,
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
    @AuthenticatedUser() user: UserDocument,
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
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.familyService.addFamilyMembers(body, user);
  }

  @Get('list-pending-requests')
  @ApiOperation({
    summary: `Used to get a user's pending requests`,
    description: `It gets both the requests of users wishing to join a faimly youre an admin of(youre the creator and youd 
      find the users in the 'pendingUserRequests' field) as well as request of family wishing to add you to the family(Your id would be in
      the 'pendingFamilyInvitations' field)`,
  })
  async getPendingRequests(@AuthenticatedUser() user: UserDocument) {
    return this.familyService.getPendingRequests(user);
  }

  @Get('get-family-list-user-can-join')
  @ApiOperation({
    summary: `Used to search for family a logged in user can join`,
    description: `search field is required.`,
  })
  async getListOfFamilyUserCanJoin(query: FindManyDto) {
    return this.familyService.getListOfFamilyUserCanJoin(query);
  }

  @Get('get-family-members')
  @ApiOperation({ summary: `get a list of members in a users family` })
  async getFamilyMembers(
    @Query() query: GetFamilyList,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.familyService.getFamilyMembers(query, user);
  }

  @Get('get-family-details/:id')
  @ApiOperation({ summary: `Used to retrieve a family details` })
  async getFamilyDetails(
    @Param('id') id: string,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.familyService.getFamilyDetails(id, user);
  }

  @Get('request-to-join-family/:familyId')
  @ApiOperation({ summary: `Used to send a request to join a family` })
  async requestToJoinFamily(
    @Param('familyId') familyId: string,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.familyService.requestToJoinFamily(familyId, user);
  }

  @Post('accept-pending-requests')
  @ApiOperation({ summary: `Used to accept or decline a pending request` })
  async acceptPendingRequests(
    @Body() body: AcceptPendingRequest,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.familyService.acceptPendingRequests(body, user);
  }

  @Get('get-users-family')
  @ApiOperation({
    summary: `Used to get a list of families a logged in user has`,
  })
  async getUsersFamily(
    query: FindManyDto,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.familyService.getUsersFamily(query, user);
  }
}
