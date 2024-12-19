import { env } from '@/configs/env.config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: Number(env.DB_PORT)
});

export const checkDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`[SUCCESS ✅] Database connection established successfully! ${env.DB_NAME}`);
  } catch (error) {
    console.error('[ERROR ❌] Database connection failed:', error);
    throw error;
  }
};

export const db = drizzle(pool);
