import { addresses } from '@/models/schema';
import { userRole } from '@/types/schema.type';
import { emailValidation, passwordValidation, phoneValidation } from '@/validations/commonValidation';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const registerUserValidation = z.object({
  email: emailValidation,
  phone: phoneValidation,
  password: passwordValidation,
  role: z.enum([userRole.RENTER, userRole.LANDLORD], { message: 'Invalid role' }),
  firstName: z.string().trim().min(1, { message: 'First name is required!' }),
  lastName: z.string().trim().min(1, { message: 'Last name is required!' })
});

export const loginUserValidation = z
  .union([
    z.object({
      email: emailValidation
    }),
    z.object({
      phone: phoneValidation
    })
  ])
  .and(z.object({ password: z.string().min(1, { message: 'Password is required!' }) }));

export const changeUserPasswordValidation = z
  .object({
    oldPassword: z.string().trim().min(1, { message: 'Old password is required.' }),
    newPassword: passwordValidation,
    confirmNewPassword: passwordValidation
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Confirm password does not match!',
    path: ['confirmPassword']
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from your old password!',
    path: ['newPassword']
  });

export const addressValidation = createInsertSchema(addresses);
