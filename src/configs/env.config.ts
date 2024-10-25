import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

dotenv.config({ path: envFile });

export const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
  DB_URL: process.env.DB_URL,
  JWT_ACCESS_KEY: process.env.JWT_ACCESS_KEY,
  JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASS: process.env.NODEMAILER_PASS
};
