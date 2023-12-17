export class ResponseMessage {
  static UNAUTHORIZED = 'Unauthorized Access';
  static UNAUTHORIZED_TOKEN = 'Unauthorized access - invalid token provided';

  static CHANGE_PASSWORD_SUCCESSFUL =
    'Password changed successfully you can login anytime with your new password';

  static REQUEST_SUCCESSFUL = 'Request treated successfully';

  static LOGIN_INVALID = 'Invalid email or password';

  static LOGIN_SUCCESS = 'Login successful';
  static SOMETHING_WRONG =
    'Oops!. Something went wrong. Try again or contact support';
  static PROFILE_NOT_FOUND: 'Profile not found';
  static EMAIL_NOT_FOUND: 'Email not found';

  static ALREADY_EXIST(entity: string): string {
    return `${entity} already exists`;
  }
}
