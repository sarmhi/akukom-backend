import { ModelDefinition } from '@nestjs/mongoose';
import { UserSchema } from './models/user.model';
import { Collections } from 'src/collections';

export const userModuleCollections: ModelDefinition[] = [
  {
    name: Collections.users,
    schema: UserSchema,
  },
];
