import { User } from 'src/user/models/user.model';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUser extends User {
  id?: any;
}

export enum Status {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  SUSPENDED = 'SUSPENDED',
}
