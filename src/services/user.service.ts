import { db } from '@/configs/database.config';
import { assets, userContacts, userDetail, users } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { UserContactsInsertSchemaType, userDetailSchemaType, userSchemaType } from '@/types/schema.type';
import { processCondition } from '@/utils/schema.helper';
import { and, desc, eq, or } from 'drizzle-orm';

// INSERT
export const insertUser = async (payload: userSchemaType) => {
  return db.insert(users).values(payload).$returningId();
};

export const insertUserDetail = async (payload: userDetailSchemaType) => {
  return db.insert(userDetail).values(payload).$returningId();
};

export const insertUserContact = async (payload: UserContactsInsertSchemaType) => {
  return db.insert(userContacts).values(payload).$returningId();
};

// SELECT
export const selectUserDetailByEmail = async (email: string) => {
  return db.select().from(userDetail).where(eq(userDetail.email, email));
};

export const selectUserDetailById = async (userId: number) => {
  return db.select().from(userDetail).where(eq(userDetail.userId, userId));
};

export const selectFullUserByConditions = async (
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

export const selectUserById = async (userId: number) => {
  return db.select().from(users).where(eq(users.id, userId)).limit(1);
};

export const selectUserByConditions = async <T extends userSchemaType>(
  conditions: ConditionsType<T>,
  limit?: number
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, users as any);
  });

  let query = db
    .select()
    .from(users)
    .where(and(...whereClause))
    .$dynamic();

  if (limit) {
    query = query.limit(limit);
  }

  return query;
};

export const selectUserAvatarByUserId = async (userId: number) => {
  return db
    .select()
    .from(assets)
    .where(and(eq(assets.userId, userId), eq(assets.folder, 'avatars')))
    .orderBy(desc(assets.createdAt))
    .limit(1);
};

export const selectUserContactByUserId = async (userId: number) => {
  return db.select().from(userContacts).where(eq(userContacts.userId, userId));
};

export const selectUserContactByContactId = async (contactId: number) => {
  return db.select().from(userContacts).where(eq(userContacts.id, contactId));
};

// UPDATE
export const updateUserDetailById = async (userId: number, payload: Partial<userDetailSchemaType>) => {
  return db.update(userDetail).set(payload).where(eq(userDetail.userId, userId)).limit(1);
};

export const updateUserById = async (userId: number, payload: Partial<userSchemaType>) => {
  return db.update(users).set(payload).where(eq(users.id, userId)).limit(1);
};

export const updateUserContactByContactId = async (
  contactId: number,
  payload: Partial<UserContactsInsertSchemaType>
) => {
  return db.update(userContacts).set(payload).where(eq(userContacts.id, contactId));
};

// DELETE
export const deleteUserContactByContactId = async (contactId: number) => {
  return db.delete(userContacts).where(eq(userContacts.id, contactId));
};
