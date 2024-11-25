import { joinPosts, passPostItems, passPosts, posts, rentalPosts, wantedPosts } from '@/models/schema';
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

export const insertJoinPostValidation = insertPostValidation.and(
  createInsertSchema(joinPosts, {
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

export const insertPassPostItemValidation = createInsertSchema(passPostItems, {
  passItemPrice: z.preprocess((value) => {
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return Number(value);
    }
    return value;
  }, z.number())
});

export const insertPassPostValidation = insertPostValidation.and(
  createInsertSchema(passPosts)
    .omit({
      priceStart: true,
      priceEnd: true
    })
    .and(
      z.object({
        passItems: z.array(insertPassPostItemValidation).min(1, {
          message: 'passItems phải có ít nhất một phần tử'
        })
      })
    )
);
