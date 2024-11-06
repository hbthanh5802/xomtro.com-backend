import { posts, rentalPosts } from '@/models/schema';
import { createInsertSchema } from 'drizzle-zod';

export const insertPostValidation = createInsertSchema(posts);
export const insertRentalPostValidation = insertPostValidation.and(
  createInsertSchema(rentalPosts).omit({ postId: true })
);
