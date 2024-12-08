import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

dotenv.config({ path: envFile });

export const env = {
  PORT: process.env.PORT,
  CLIENT_BASE_URL: process.env.CLIENT_BASE_URL,
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
  NODEMAILER_PASS: process.env.NODEMAILER_PASS,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET_KEY: process.env.CLOUDINARY_SECRET_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  DISTANCEMETRIX_DISTANCE_API_KEY: process.env.DISTANCEMETRIX_DISTANCE_API_KEY,
  DISTANCEMETRIX_GEOCODING_API_KEY: process.env.DISTANCEMETRIX_GEOCODING_API_KEY,
  GEOCODEMAP_API_KEY: process.env.GEOCODEMAP_API_KEY,
  GOONG_API_KEY_1: process.env.GOONG_API_KEY_1,
  GOONG_API_KEY_2: process.env.GOONG_API_KEY_2
};
