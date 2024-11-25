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
}).pick({
  passItemName: true,
  passItemPrice: true,
  passItemStatus: true
});

export const insertPassPostValidation = createInsertSchema(passPosts)
  .omit({
    postId: true,
    priceStart: true,
    priceEnd: true,
    priceUnit: true
  })
  .and(insertPostValidation)
  .and(
    z.object({
      passItems: z
        .string() // Bắt đầu với chuỗi
        .transform((val, ctx) => {
          try {
            // Parse chuỗi JSON thành mảng object
            const parsed = JSON.parse(val);
            if (!Array.isArray(parsed)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'passItems phải là một mảng JSON hợp lệ'
              });
              return z.NEVER;
            }
            return parsed; // Trả về mảng để tiếp tục validate
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'passItems không phải là một chuỗi JSON hợp lệ'
            });
            return z.NEVER;
          }
        })
        .pipe(
          z.array(insertPassPostItemValidation).min(1, {
            message: 'passItems phải có ít nhất một phần tử'
          })
        )
    })
  );
