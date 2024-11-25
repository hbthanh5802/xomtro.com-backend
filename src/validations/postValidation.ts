import { posts, rentalPosts, wantedPosts } from '@/models/schema';
import { dateValidation } from '@/validations/commonValidation';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const insertPostValidation = createInsertSchema(posts, {
  expirationAfter: z.preprocess((value) => {
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return Number(value);
    }
    return value;
  }, z.number())
});
export const insertRentalPostValidation = insertPostValidation.and(
  createInsertSchema(rentalPosts, {
    numberRoomAvailable: z.preprocess((value) => {
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    }, z.number()),
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

export const insertWantedPostValidation = insertPostValidation.and(
  createInsertSchema(wantedPosts, {
    moveInDate: dateValidation,
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
