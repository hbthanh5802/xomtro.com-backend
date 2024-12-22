import { postComments } from '@/models/schema';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const insertPostCommentValidation = createInsertSchema(postComments, {
  content: z.string()
}).refine(
  (data) => {
    if (!data.tags?.trim()) {
      return data.content.trim() !== '';
    }
    return true;
  },
  {
    message: 'Content cannot be empty if tags are not provided.',
    path: ['content']
  }
);
