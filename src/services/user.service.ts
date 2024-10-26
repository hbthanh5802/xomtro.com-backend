import { db } from '@/configs/database.config';
import { userDetail, users } from '@/models/schema';
import { userDetailSchemaType, userSchemaType } from '@/types/schema.type';
import { eq, or } from 'drizzle-orm';

// INSERT
export const createUser = async (payload: userSchemaType) => {
  return db.insert(users).values(payload).$returningId();
};

export const createUserDetail = async (payload: userDetailSchemaType) => {
  return db.insert(userDetail).values(payload).$returningId();
};

// SELECT
export const getUserDetailByEmail = async (email: string) => {
  return db.select().from(userDetail).where(eq(userDetail.email, email));
};

export const getFullUserByConditions = async (
  filters: Partial<Pick<userDetailSchemaType, 'userId' | 'phone' | 'email'>>
) => {
  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(userDetail.userId, filters.userId));
  }

  if (filters.email) {
    conditions.push(eq(userDetail.email, filters.email));
  }

  if (filters.phone) {
    conditions.push(eq(userDetail.phone, filters.phone));
  }

  return db
    .select()
    .from(users)
    .innerJoin(userDetail, eq(users.id, userDetail.userId))
    .where(or(...conditions));
};

export const getUserById = async (userId: number) => {
  return db.select().from(users).where(eq(users.id, userId)).limit(1);
};

// UPDATE
export const updateUserDetailById = async (userId: number, payload: Partial<userDetailSchemaType>) => {
  return db.update(userDetail).set(payload).where(eq(userDetail.userId, userId)).limit(1);
};

export const updateUserById = async (userId: number, payload: Partial<userSchemaType>) => {
  return db.update(users).set(payload).where(eq(users.id, userId)).limit(1);
};
