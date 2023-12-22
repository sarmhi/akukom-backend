import {
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/user';
import { FamilyRepository } from '../repository';
import {
  AddFamilyMembers,
  CreateFamilyDto,
  EditFamilyDto,
} from '../dtos/family.dto';
import {
  FileService,
  IUser,
  ResponseMessage,
  S3BucketService,
} from 'src/common';
import { Family } from '../models';
import { ObjectId } from 'mongoose';

@Injectable()
export class FamilyService {
  private logger = new Logger(FamilyService.name);
  constructor(
    private readonly userRepo: UserRepository,
    private readonly familyRepo: FamilyRepository,
    private readonly s3BucketService: S3BucketService,
    private readonly fileService: FileService,
  ) {}

  async createFamily(
    body: CreateFamilyDto,
    user: IUser,
    file: Express.Multer.File,
  ) {
    const foundUserInDb = await this.userRepo.findById(user.id);
    if (!foundUserInDb) throw new NotFoundException(`User not found`);
    const { url, key } = await this.fileService.uploadPublicFile(
      file.buffer,
      `family-image-${file.originalname}`,
      file.mimetype,
    );
    const createdFamily = await this.familyRepo.create({
      ...body,
      creator: user.id,
      image: url,
      imageKey: key,
    });
    user.family = createdFamily.id;
    await foundUserInDb.save();
    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: createdFamily,
    };
  }

  async checkUserInFamily(userId: string, familyId: string, user: IUser) {
    const foundUserInDb = await this.userRepo.findById(userId);
    if (!foundUserInDb) throw new NotFoundException(`User not found`);

    await this.validateFamilyMembership(familyId, user);

    const foundUserInFamily = await this.familyRepo.findOne({
      _id: familyId,
      members: userId,
    });

    if (!foundUserInFamily)
      throw new NotFoundException(
        `User ${userId} is not a member of this family`,
      );

    return {
      message: ResponseMessage.USER_FOUND,
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async editFamilyDetails(
    body: EditFamilyDto,
    user: IUser,
    file?: Express.Multer.File,
  ) {
    const { description, name, familyId } = body;
    const { foundFamilyInDb } = await this.validateFamilyMembership(
      familyId,
      user,
    );

    if (file) {
      if (foundFamilyInDb.image) {
        const deleted = await this.fileService.deletePublicFile(
          foundFamilyInDb.imageKey,
        );
        if (deleted) {
          foundFamilyInDb.image = null;
          foundFamilyInDb.imageKey = null;
        }
      }
      const { url, key } = await this.fileService.uploadPublicFile(
        file.buffer,
        `family-image-${file.originalname}`,
        file.mimetype,
      );
      foundFamilyInDb.image = url;
      foundFamilyInDb.imageKey = key;
    }
    if (name) {
      foundFamilyInDb.name = name;
    }

    if (description) {
      foundFamilyInDb.description = description;
    }

    const updatedFamilyInDb = await foundFamilyInDb.save();
    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedFamilyInDb,
    };
  }

  async addFamilyMembers(body: AddFamilyMembers, user: IUser) {
    const { familyId, usersToAdd } = body;
    const { foundFamilyInDb } = await this.validateFamilyMembership(
      familyId,
      user,
    );

    const clonedMembers = [...foundFamilyInDb.members];

    for (let index = 0; index < usersToAdd.length; index++) {
      const userToAdd = usersToAdd[index];
      if (clonedMembers.includes(userToAdd)) {
        clonedMembers.filter((member) => member !== userToAdd);
      }
      foundFamilyInDb.pendingFamilyInvitations.push(userToAdd);
    }

    const updatedFamilyInDb = await foundFamilyInDb.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedFamilyInDb,
    };
  }

  async getPendingFamilyInvitations(user: IUser) {
    const foundFamilyInvites = await this.familyRepo.find(
      {
        pendingFamilyInvitations: user.id,
      },
      { name: 1, image: 1, id: 1 },
    );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: foundFamilyInvites,
    };
  }

  private async validateFamilyMembership(familyId: string, user: IUser) {
    const foundUserInDb = await this.userRepo.findById(user.id);
    if (!foundUserInDb) throw new NotFoundException(`User not found`);

    const userFamilies: (string | ObjectId | Family)[] =
      foundUserInDb.family as (ObjectId | string | Family)[];

    if (!userFamilies.some((item) => item === familyId))
      throw new ConflictException('User is not a member of this Family.');

    const foundFamilyInDb = await this.familyRepo.findById(familyId);
    if (!foundFamilyInDb) throw new NotFoundException(`Family not found `);
    return {
      foundUserInDb,
      foundFamilyInDb,
    };
  }
}
