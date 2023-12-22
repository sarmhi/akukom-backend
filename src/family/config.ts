import { ModelDefinition } from '@nestjs/mongoose';
import { Collections } from 'src/collections';
import { FamilySchema } from './models';

export const familyModuleCollections: ModelDefinition[] = [
  {
    name: Collections.family,
    schema: FamilySchema,
  },
];
