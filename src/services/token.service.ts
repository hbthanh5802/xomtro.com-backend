import { db } from '@/configs/database.config';
import { tokens } from '@/models/schema';
import { Condition, ConditionsType } from '@/types/drizzle.type';
import { tokenSchemaType } from '@/types/schema.type';
import { processCondition, queryOptions, withPagination } from '@/utils/schema.helper';
import { and, desc, eq, gt, gte, lt, lte, sql } from 'drizzle-orm';

// Insert
export const insertToken = async (payload: tokenSchemaType) => {
  return db.insert(tokens).values(payload);
};

// Delete
export const removeTokenById = async (tokenId: number) => {
  return db.delete(tokens).where(eq(tokens.id, tokenId));
};

export const removeTokenByCondition = async (
  filters: Partial<tokenSchemaType>,
  options?: queryOptions<tokenSchemaType> & { limit?: number }
) => {
  const conditions = [];

  if (filters.id) {
    conditions.push(eq(tokens.id, filters.id));
  }

  if (filters.userId) {
    conditions.push(eq(tokens.userId, filters.userId));
  }

  if (filters.value) {
    conditions.push(eq(tokens.value, filters.value));
  }

  if (filters.type) {
    conditions.push(eq(tokens.type, filters.type));
  }

  if (filters.isActived) {
    conditions.push(eq(tokens.isActived, filters.isActived));
  }

  if (filters.expirationTime) {
    conditions.push(gt(tokens.expirationTime, filters.expirationTime));
  }

  if (conditions.length === 0) {
    return db.select().from(tokens);
  }

  let query = db
    .delete(tokens)
    .where(and(...conditions))
    .$dynamic();

  if (options && options.orderField) {
    query = query.orderBy(tokens[options.orderField]);
  }

  if (options && options.limit) {
    query = query.limit(options.limit);
  }

  return query;
};

//  Select
export const searchTokenByCondition = async (
  filters: Partial<tokenSchemaType>,
  options?: queryOptions<tokenSchemaType>
) => {
  const conditions = [];

  if (filters.id) {
    conditions.push(eq(tokens.id, filters.id));
  }

  if (filters.userId) {
    conditions.push(eq(tokens.userId, filters.userId));
  }

  if (filters.value) {
    conditions.push(eq(tokens.value, filters.value));
  }

  if (filters.type) {
    conditions.push(eq(tokens.type, filters.type));
  }

  if (filters.isActived) {
    conditions.push(eq(tokens.isActived, filters.isActived));
  }

  if (filters.expirationTime) {
    conditions.push(gt(tokens.expirationTime, filters.expirationTime));
  }

  if (conditions.length === 0) {
    let query = db.select().from(tokens).$dynamic();

    if (options && options.orderField) {
      query =
        options.orderDirection === 'asc'
          ? query.orderBy(tokens[options.orderField])
          : query.orderBy(desc(tokens[options.orderField]));
    }

    if (options && options.pageSize) {
      query = withPagination(query, options.page, options.pageSize);
    }

    return query;
  }

  let query = db
    .select()
    .from(tokens)
    .where(and(...conditions))
    .$dynamic();

  if (options && options.orderField) {
    query =
      options.orderDirection === 'asc'
        ? query.orderBy(tokens[options.orderField])
        : query.orderBy(desc(tokens[options.orderField]));
  }

  if (options && options.pageSize) {
    query = withPagination(query, options.page, options.pageSize);
  }

  return query;
};

// Update
export const updateTokenWithConditions = async <T extends tokenSchemaType>(
  payload: Partial<T>,
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field as keyof T, condition as Condition<T, keyof T>, tokens as any);
  });

  return db
    .update(tokens)
    .set(payload)
    .where(and(...whereClause));
};
