export interface IResponse<T> {
  statusCode: number;
  message?: string;
  success?: boolean;
  data?: T;
}
