import { Condition } from '@/types/drizzle.type';
import {
  SQLWrapper,
  asc,
  between,
  desc,
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

//
export const processOrderCondition = <T>(
  field: keyof T,
  direction: 'asc' | 'desc',
  table: Record<string, MySqlColumn>
): SQLWrapper => {
  const column = table[field as string];

  switch (direction) {
    case 'asc':
      return asc(column);
    case 'desc':
      return desc(column);
    default:
      return asc(column);
  }
};

export type orderConditionType<T> = {
  [K in keyof T]?: 'asc' | 'desc';
};

export type selectOptions<T> = {
  pagination?: { page: number; pageSize?: number };
  orderConditions?: orderConditionType<T>;
};

export const paginationHelper = ({ total, page, pageSize }: { total: number; page?: number; pageSize?: number }) => {
  const currentPage = page || 1;
  const currentPageSize = pageSize || 10;
  return {
    totalCount: total,
    totalPages: Math.ceil(total / currentPageSize),
    currentPage: currentPage,
    currentPageSize: currentPageSize,
    canPrevious: currentPage > 1,
    canNext: currentPage * currentPageSize < total
  };
};
