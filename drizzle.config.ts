import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { env } from './src/configs/env.config';

export default defineConfig({
  out: './drizzle',
  schema: './src/models/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  }
});
