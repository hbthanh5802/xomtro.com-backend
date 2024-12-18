import { postComments } from '@/models/schema';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const insertPostCommentValidation = createInsertSchema(postComments, {
  content: z.string()
}).refine(
  (data) => {
    // Nếu không có tags, content không được rỗng
    console.log(data);
    if (!data.tags?.trim()) {
      return data.content.trim() !== '';
    }
    return true;
  },
  {
    message: 'Content cannot be empty if tags are not provided.',
    path: ['content'] // Chỉ định lỗi sẽ được gán vào trường "content"
  }
);
