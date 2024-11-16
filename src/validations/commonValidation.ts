import dayjs from 'dayjs';
import { z } from 'zod';

export const emailValidation = z
  .string()
  .trim()
  .min(1, { message: 'Email is required!' })
  .email({ message: 'Email is invalid!' });

const phoneRegex = /^(0|\+84)(\d{9})$/;
export const phoneValidation = z.string().trim().regex(phoneRegex, 'Invalid phone number format');

export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
export const passwordValidation = z
  .string()
  .trim()
  .regex(
    passwordRegex,
    'Password must contain at least 6 characters, including 1 uppercase letter, 1 number, 1 special symbol (Example: @,$,!,%,*,?,&)'
  );

export const dateValidation = z.string().refine((date) => dayjs(date, 'YYYY-MM-DD', true).isValid(), {
  message: 'Thông tin không đúng định dạng YYYY-MM-DD'
});
