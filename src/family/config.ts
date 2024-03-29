import { ModelDefinition } from '@nestjs/mongoose';
import { Collections } from 'src/collections';
import { EventSchema, FamilySchema, RequestSchema } from './models';

export const familyModuleCollections: ModelDefinition[] = [
  {
    name: Collections.family,
    schema: FamilySchema,
  },
  {
    name: Collections.request,
    schema: RequestSchema,
  },
  {
    name: Collections.events,
    schema: EventSchema,
  },
];
