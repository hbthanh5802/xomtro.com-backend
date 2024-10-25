import { userRole } from '@/types/schema.type';
import { emailValidation, passwordValidation, phoneValidation } from '@/validations/commonValidation';
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
  .and(z.object({ password: passwordValidation }));
