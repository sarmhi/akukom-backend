import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { IUser } from 'src/common/interfaces/user/user.interface';

@Injectable()
export class UserService {
  logger: Logger = new Logger(UserService.name);

  constructor(private readonly userRepo: UserRepository) {}

  async findUserbyPhoneOrEmail(phone: string, email: string) {
    const query: any = {};

    if (phone) {
      query.$or = [{ phone }];
    }

    if (email) {
      query.$or = query.$or || [];
      query.$or.push({ email });
    }

    return this.userRepo.findOne(query);
  }

  async findUserbyEmail(email: string) {
    return this.userRepo.findOne({ email: email });
  }

  async findUserbyPhone(phone: string) {
    return this.userRepo.findOne({ phone: phone });
  }

  async createUser(user: Partial<IUser>) {
    return await this.userRepo.create(user);
  }

  async updateUser(id: string, user: Partial<IUser>) {
    return await this.userRepo.findOneAndUpDate({ _id: id }, { ...user });
  }
}
