import { Condition } from '@/types/drizzle.type';
import {
  SQLWrapper,
  between,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  notInArray,
  sql
} from 'drizzle-orm';
import { MySqlColumn, MySqlSelect, timestamp } from 'drizzle-orm/mysql-core';

export const timestamps = {
  createdAt: timestamp('created_at').default(sql`(now())`),
  updatedAt: timestamp('updated_at')
    .default(sql`(now())`)
    .onUpdateNow()
};

export const withPagination = <T extends MySqlSelect>(qb: T, page: number = 1, pageSize: number = 10) => {
  return qb.limit(pageSize).offset((page - 1) * pageSize);
};

export type queryOptions<T> = {
  orderDirection: 'asc' | 'desc';
  orderField?: keyof T;
  page?: number;
  pageSize?: number;
};

// Function để xử lý một condition đơn
export const processCondition = <T>(
  field: keyof T,
  condition: Condition<T, keyof T>,
  table: Record<string, MySqlColumn>
): SQLWrapper => {
  const column = table[field as string];
  const { operator, value } = condition;

  switch (operator) {
    case 'eq':
      return eq(column, value);
    case 'ne':
      return ne(column, value);
    case 'gt':
      return gt(column, value);
    case 'gte':
      return gte(column, value);
    case 'lt':
      return lt(column, value);
    case 'lte':
      return lte(column, value);
    case 'in':
      return inArray(column, value as any[]);
    case 'notIn':
      return notInArray(column, value as any[]);
    case 'between':
      const [min, max] = value as [any, any];
      return between(column, min, max);
    case 'like':
      return like(column, value as string);
    case 'ilike':
      return ilike(column, value as string);
    case 'isNull':
      return isNull(column);
    case 'isNotNull':
      return isNotNull(column);
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
};
