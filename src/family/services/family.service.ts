import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDocument, UserRepository } from 'src/user';
import { FamilyRepository, RequestRepository } from '../repository';
import {
  AcceptPendingRequest,
  AddFamilyMembers,
  CreateFamilyDto,
  EditFamilyDto,
  GetFamilyList,
} from '../dtos/family.dto';
import { FileService, FindManyDto, ResponseMessage } from 'src/common';
import { Family, RequestStatus, RequestType } from '../models';
import { ObjectId } from 'mongoose';

@Injectable()
export class FamilyService {
  private logger = new Logger(FamilyService.name);
  constructor(
    private readonly userRepo: UserRepository,
    private readonly familyRepo: FamilyRepository,
    private readonly fileService: FileService,
    private readonly requestRepo: RequestRepository,
  ) {}

  async createFamily(
    body: CreateFamilyDto,
    user: UserDocument,
    file: Express.Multer.File,
  ) {
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
    await user.save();
    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: createdFamily,
    };
  }

  async checkUserInFamily(
    userId: string,
    familyId: string,
    user: UserDocument,
  ) {
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
    user: UserDocument,
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

  async addFamilyMembers(body: AddFamilyMembers, user: UserDocument) {
    const { familyId, usersToAdd } = body;
    let updatedFamilyInDb;
    const { foundFamilyInDb } = await this.validateFamilyMembership(
      familyId,
      user,
    );

    if (foundFamilyInDb.creator !== user.id)
      throw new ConflictException('Only admins can add members');

    const clonedMembers = [...foundFamilyInDb.members];
    const session = await this.familyRepo.startTransaction();
    try {
      for (let index = 0; index < usersToAdd.length; index++) {
        const userToAdd = usersToAdd[index];
        if (clonedMembers.includes(userToAdd)) {
          clonedMembers.filter((member) => member !== userToAdd);
        }
        const newRequest = await this.requestRepo.create({
          requestType: RequestType.FAMILY_INVITATION,
          user: userToAdd,
          family: familyId,
        });
        foundFamilyInDb.pendingRequests.push(newRequest.id);
      }
      updatedFamilyInDb = await foundFamilyInDb.save();
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      this.logger.error({ error: err });
      throw new InternalServerErrorException(
        'Unable to add members at this moment, please try again later.',
      );
    } finally {
      await session.endSession();
    }

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedFamilyInDb,
    };
  }

  async getPendingRequests(user: UserDocument) {
    const foundFamilyInvites = await this.requestRepo.find(
      {
        $or: [{ family: { creator: user.id } }, { user: user.id }],
      },
      { populate: ['family', 'user'] },
    );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: foundFamilyInvites,
    };
  }

  async getListOfFamilyUserCanJoin(query: FindManyDto) {
    const { search } = query;
    const condition = {};
    if (search) {
      condition['$or'] = [{ name: { $regex: search, $options: 'i' } }];
    }

    const foundFamilyInDb = await this.familyRepo.findManyWithPagination(
      condition,
      query,
    );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: foundFamilyInDb,
    };
  }

  async getFamilyMembers(query: GetFamilyList, user: UserDocument) {
    const { familyId } = query;
    const { foundFamilyInDb } = await this.validateFamilyMembership(
      familyId,
      user,
      null,
      null,
      null,
      ['members'],
    );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: foundFamilyInDb.members,
    };
  }

  async getFamilyDetails(id: string, user: UserDocument) {
    const { foundFamilyInDb } = await this.validateFamilyMembership(
      id,
      user,
      null,
      null,
      null,
      ['members'],
    );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: foundFamilyInDb,
    };
  }

  async requestToJoinFamily(familyId: string, user: UserDocument) {
    const foundFamilyInDb = await this.familyRepo.findById(familyId);
    if (!foundFamilyInDb) throw new NotFoundException(`Family not found `);

    if (foundFamilyInDb.members && foundFamilyInDb.members.includes(user.id))
      throw new ConflictException(`User is already a member of this family`);

    const newRequest = await this.requestRepo.create({
      requestType: RequestType.FAMILY_INVITATION,
      user: user.id,
      family: familyId,
    });
    foundFamilyInDb.pendingRequests.push(newRequest.id);
    const updatedFamilyInDb = await foundFamilyInDb.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedFamilyInDb,
    };
  }

  async acceptPendingRequests(body: AcceptPendingRequest, user: UserDocument) {
    const { accepted, requestId } = body;
    const foundRequestInDb = await this.requestRepo.findById(
      requestId,
      {},
      { populate: ['user', 'family'] },
    );
    if (!foundRequestInDb) throw new NotFoundException('Request not found');

    if (foundRequestInDb.requestType === RequestType.FAMILY_INVITATION) {
      if (foundRequestInDb.family.id !== user.id)
        throw new UnauthorizedException(
          'User cannot accept or decline an invitation that is not his',
        );
    } else {
      if (foundRequestInDb.family.creator !== user.id)
        throw new UnauthorizedException(
          'User can only accept or decline an invitation into a family that he is the admin',
        );
    }
    if (accepted) {
      foundRequestInDb.status = RequestStatus.ACCEPTED;
      const foundFamilyInDb = await this.familyRepo.findById(
        foundRequestInDb.family.id,
        {},
        { populate: ['members'] },
      );
      if (!foundFamilyInDb) throw new NotFoundException('Family not found');
      foundFamilyInDb.members.push(user.id);
    } else {
      foundRequestInDb.status = RequestStatus.DECLINED;
    }
    const updatedRequestInDb = await foundRequestInDb.save();

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: updatedRequestInDb,
    };
  }

  async getUsersFamily(query: FindManyDto, user: UserDocument) {
    const { search } = query;
    const condition = {
      members: user.id,
    };

    if (search) {
      condition['$or'] = [{ name: { $regex: search, $options: 'i' } }];
    }

    const foundFamilyInDb = await this.familyRepo.findManyWithPagination(
      condition,
      query,
    );

    return {
      message: ResponseMessage.REQUEST_SUCCESSFUL,
      success: true,
      statusCode: HttpStatus.OK,
      data: foundFamilyInDb,
    };
  }

  private async validateFamilyMembership(
    familyId: string,
    user: UserDocument,
    userProjection?: Record<string, any>,
    userPopulation?: string[],
    familyProjection?: Record<string, any>,
    familyPopulation?: string[],
  ) {
    const foundUserInDb = await this.userRepo.findById(
      user.id,
      userProjection,
      {
        populate: userPopulation,
      },
    );
    if (!foundUserInDb) throw new NotFoundException(`User not found`);

    const userFamilies: (string | ObjectId | Family)[] =
      foundUserInDb.family as (ObjectId | string | Family)[];

    if (!userFamilies.some((item) => item === familyId))
      throw new ConflictException('User is not a member of this Family.');

    const foundFamilyInDb = await this.familyRepo.findById(
      familyId,
      familyProjection,
      {
        populate: familyPopulation,
      },
    );
    if (!foundFamilyInDb) throw new NotFoundException(`Family not found `);
    return {
      foundUserInDb,
      foundFamilyInDb,
    };
  }
}
