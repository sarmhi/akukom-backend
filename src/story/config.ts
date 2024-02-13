import { ModelDefinition } from '@nestjs/mongoose';
import { Collections } from 'src/collections';
import {
  StoryCommentRepliesSchema,
  StoryCommentSchema,
  StoryMediaSchema,
  StorySchema,
} from './models';

export const storyModuleCollections: ModelDefinition[] = [
  {
    name: Collections.story,
    schema: StorySchema,
  },
  {
    name: Collections.story_comments,
    schema: StoryCommentSchema,
  },
  {
    name: Collections.story_comments_replies,
    schema: StoryCommentRepliesSchema,
  },
  {
    name: Collections.story_media,
    schema: StoryMediaSchema,
  },
];
