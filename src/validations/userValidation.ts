import { addresses, userDetail } from '@/models/schema';
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

export const oAuthValidation = z.object({
  credential: z.string().trim().min(1, { message: 'Credential is required!' })
});

export const addressValidation = createInsertSchema(addresses);

export const forgotPasswordValidation = z
  .object({
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: passwordValidation,
    otpCode: z.string().length(6, { message: 'OTP has the invalid length!' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password must be similar to Password',
    path: ['confirmPassword']
  });

export const updateUserProfileValidation = createInsertSchema(userDetail)
  .pick({
    bio: true,
    firstName: true,
    lastName: true,
    gender: true,
    phone: true
  })
  .strict()
  .partial();
