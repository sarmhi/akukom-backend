import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from 'src/common/interfaces';

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType() === 'http') {
      return ctx.switchToHttp().getRequest().user as IUser;
    }
    if (ctx.getType() === 'ws') {
      return ctx.switchToWs().getClient().user as IUser;
    }
    if (ctx.getType() === 'rpc') {
      return ctx.switchToRpc().getData().user as IUser;
    }
  },
);
