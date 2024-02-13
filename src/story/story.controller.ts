import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtUserAuthGuard } from 'src/common/guards/user/jwt.guard';
import { StoryService } from './story.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { AuthenticatedUser, FindManyDto } from 'src/common';
import { UserDocument } from 'src/user';
import {
  AddStoryBuddies,
  CreateStoryDto,
  TagUsersToStoryDto,
} from './dtos/story.dto';

@ApiTags('Story')
@ApiBearerAuth()
@UseGuards(JwtUserAuthGuard)
@Controller({
  version: '1',
  path: 'story',
})
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post('create-story')
  @ApiOperation({ summary: `Creates a new user story` })
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
  async createStory(
    @Body() body: CreateStoryDto,
    @AuthenticatedUser() user: UserDocument,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.storyService.createStory(body, user, file);
  }

  @Post('tag-users-to-story')
  @ApiOperation({ summary: `Tags users to a story` })
  async tagUsersToStory(
    @Body() body: TagUsersToStoryDto,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.storyService.tagUsersToStory(body, user);
  }

  @Get('get-all-stories')
  @ApiOperation({ summary: `Gets all user's stories` })
  async getAllStories(
    @Query() query: FindManyDto,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.storyService.getAllStories(query, user);
  }

  @Post('add-story-buddies')
  @ApiOperation({ summary: `Gets all user's stories` })
  async addStoryBuddies(
    @Body() body: AddStoryBuddies,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.storyService.addStoryBuddies(body, user);
  }

  @Post('upload-story-media')
  @ApiOperation({
    summary: `Used to upload media(images and videos) to a story`,
  })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'media', maxCount: 5 }]))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['media'],
      properties: {
        media: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async addStoryMedia(
    @Query('storyId') storyId: string,
    @AuthenticatedUser() user: UserDocument,
    @UploadedFiles()
    files: {
      media: Express.Multer.File[];
    },
  ) {
    return this.storyService.addStoryMedia(storyId, user, files);
  }

  @Delete()
  async deleteStory(
    @Query('storyId') storyId: string,
    @AuthenticatedUser() user: UserDocument,
  ) {
    return this.storyService.deleteStory(storyId, user);
  }
}
