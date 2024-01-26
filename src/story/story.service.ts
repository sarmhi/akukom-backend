import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  StoryCommentRepliesRepository,
  StoryCommentRepository,
  StoryMediaRepository,
  StoryRepository,
} from './repository';
import { FileService, FindManyDto, ResponseMessage } from 'src/common';
import {
  AddStoryBuddies,
  CreateStoryDto,
  TagUsersToStoryDto,
} from './dtos/story.dto';
import { UserDocument, UserRepository } from 'src/user';
import * as dayjs from 'dayjs';

@Injectable()
export class StoryService {
  private logger: Logger = new Logger(StoryService.name);

  constructor(
    private readonly storyRepo: StoryRepository,
    private readonly storyCommentRepo: StoryCommentRepository,
    private readonly storyMediaRepo: StoryMediaRepository,
    private readonly storyCommentRepliesRepo: StoryCommentRepliesRepository,
    private readonly fileService: FileService,
    private readonly userRepo: UserRepository,
  ) {}

  async createStory(
    body: CreateStoryDto,
    user: UserDocument,
    file?: Express.Multer.File,
  ) {
    const { date, title, description, location } = body;
    let coverImageUrl;
    let coverImageKey;
    if (date) {
      const storyDate = dayjs(date);
      if (storyDate.isBefore(dayjs().format('MM/DD/YYYY')))
        throw new BadRequestException(
          'Date cannot be before today!, please check your dates',
        );
    }
    if (file) {
      const { url, key } = await this.fileService.uploadPublicFile(
        file.buffer,
        `story-cover-image-${file.originalname}`,
        file.mimetype,
      );
      coverImageUrl = url;
      coverImageKey = key;
    }
    const newStory = await this.storyRepo.create({
      date,
      location,
      description,
      title,
      coverImageUrl,
      coverImageKey,
      creator: user.id,
    });
    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: newStory,
    };
  }

  async tagUsersToStory(body: TagUsersToStoryDto, user: UserDocument) {
    const { storyId, usersToTag } = body;
    let updatedStoryInDb;
    const foundStoryInDb = await this.storyRepo.findOne({ id: storyId });
    if (!foundStoryInDb) throw new NotFoundException(`Story not found`);
    if (foundStoryInDb.creator !== user.id)
      throw new ForbiddenException(`Only a story creator can tag users`);

    const session = await this.storyRepo.startTransaction();
    try {
      for (let index = 0; index < usersToTag.length; index++) {
        const userToTag = usersToTag[index];
        const foundUser = await this.userRepo.findOne({ id: userToTag });
        if (!foundUser)
          throw new NotFoundException('A user you want to tag does not exist');
        foundStoryInDb.taggedUsers.push(userToTag);
      }
      updatedStoryInDb = await foundStoryInDb.save();
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      this.logger.error({ error: err });
      throw new InternalServerErrorException(
        'Unable to tag users at this moment, please try again later.',
      );
    } finally {
      await session.endSession();
    }

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedStoryInDb,
    };
  }

  async getAllStories(query: FindManyDto, user: UserDocument) {
    const { search } = query;
    const condition = {
      creator: user.id,
      taggedUsers: user.id,
      storyBuddies: user.id,
    };
    if (search) {
      condition['$or'] = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const foundStoriesInDb = await this.storyRepo.findManyWithPagination(
      condition,
      query,
    );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: foundStoriesInDb,
    };
  }

  async addStoryBuddies(body: AddStoryBuddies, user: UserDocument) {
    const { storyId, usersToAdd } = body;
    let updatedStoryInDb;
    const foundStoryInDb = await this.storyRepo.findOne({ id: storyId });
    if (!foundStoryInDb) throw new NotFoundException(`Story not found`);
    if (foundStoryInDb.creator !== user.id)
      throw new ForbiddenException(
        `Only a story creator can add story buddies`,
      );
    const session = await this.storyRepo.startTransaction();
    try {
      for (let index = 0; index < usersToAdd.length; index++) {
        const userToAdd = usersToAdd[index];
        const foundUser = await this.userRepo.findOne({ id: userToAdd });
        if (!foundUser)
          throw new NotFoundException(
            'A user you want to make a story buddy does not exist',
          );
        foundStoryInDb.storyBuddies.push(userToAdd);
      }
      updatedStoryInDb = await foundStoryInDb.save();
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      this.logger.error({ error: err });
      throw new InternalServerErrorException(
        'Unable to make users story buddies at this moment, please try again later.',
      );
    } finally {
      await session.endSession();
    }

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedStoryInDb,
    };
  }

  async addStoryMedia(
    storyId: string,
    user: UserDocument,
    files: {
      media: Express.Multer.File[];
    },
  ) {
    const foundStoryInDb = await this.storyRepo.findOne({ id: storyId });
    if (!foundStoryInDb) throw new NotFoundException(`Story not found`);
    if (
      !foundStoryInDb.storyBuddies.includes(user.id) ||
      foundStoryInDb.creator !== user.id
    )
      throw new ForbiddenException(
        `You must be a story buddy or the story creator to upload media.`,
      );
    const mediaFiles = files.media;

    // Extract relevant file information (buffer, filename, mimetype)
    const fileData = mediaFiles.map((file) => ({
      dataBuffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
    }));

    // Upload multiple files
    const uploadedFiles = await this.fileService.uploadMultipleFiles(fileData);

    // You can now use the 'uploadedFiles' array in your logic
    for (let index = 0; index < uploadedFiles.length; index++) {
      const file = uploadedFiles[index];
      const uploadedFile = await this.storyMediaRepo.create({
        mediaUrl: file.url,
        mediaKey: file.key,
      });
      foundStoryInDb.media.push(uploadedFile);
    }

    const updatedStoryInDb = await foundStoryInDb.save();

    // Todo alert all stakeholders in the background about new media

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedStoryInDb,
    };
  }

  async deleteStory(storyId: string, user: UserDocument) {
    const foundStoryInDb = await this.storyRepo.findOne({ id: storyId }, null, {
      populate: [''],
    });
    if (!foundStoryInDb) throw new NotFoundException(`Story not found`);
    if (foundStoryInDb.creator !== user.id)
      throw new ForbiddenException(
        `You must be the story creator to delete this story.`,
      );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      // data: updatedStoryInDb,
    };
  }
}
