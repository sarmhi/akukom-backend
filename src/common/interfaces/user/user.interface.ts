export interface IUser {
  _id?: any;
  id?: any;
  email: string;
  firstName: string;
  lastName: string;
  password: string;

  createdAt?: Date;
  updatedAt?: Date;
  phoneOtp?: string;
}
