import { posts, rentalPosts } from '@/models/schema';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const insertPostValidation = createInsertSchema(posts);
export const insertRentalPostValidation = insertPostValidation.and(
  createInsertSchema(rentalPosts, {
    minLeaseTerm: z.preprocess((value) => {
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    }, z.number()),
    totalArea: z.preprocess((value) => {
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    }, z.number()),
    priceEnd: z.preprocess((value) => {
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    }, z.number()),
    priceStart: z.preprocess((value) => {
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    }, z.number())
  }).omit({ postId: true })
);
