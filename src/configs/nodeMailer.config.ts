import { env } from '@/configs/env.config';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.NODEMAILER_USER,
    pass: env.NODEMAILER_PASS
  }
});
