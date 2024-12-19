import { db } from '@/configs/database.config';
import { notifications } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { NotificationInsertSchemaType, NotificationSelectSchemaType } from '@/types/schema.type';
import { processCondition, processOrderCondition, selectOptions, withPagination } from '@/utils/schema.helper';
import { and, SQLWrapper } from 'drizzle-orm';

// INSERT
export const insertNotification = async (payload: NotificationInsertSchemaType) => {
  return db.insert(notifications).values(payload).$returningId();
};

// SELECT
export const selectNotificationByConditions = async <T extends NotificationSelectSchemaType>(
  conditions: ConditionsType<T>,
  options?: selectOptions<NotificationSelectSchemaType>
) => {
  let whereClause: (SQLWrapper | undefined)[] = [];
  let orderClause: SQLWrapper[] = [];

  if (conditions) {
    whereClause = Object.entries(conditions).map(([field, condition]) => {
      return processCondition(field, condition, notifications as any);
    });
  }

  if (options?.orderConditions) {
    const { orderConditions } = options;
    orderClause = Object.entries(orderConditions).map(([field, direction]) => {
      return processOrderCondition(field, direction, notifications as any);
    });
  }

  let query = db.select().from(notifications).$dynamic();
  if (whereClause.length) {
    query = query.where(and(...whereClause)).$dynamic();
  }
  if (orderClause.length) {
    query = query.orderBy(...(orderClause as any)).$dynamic();
  }

  const pagination = options?.pagination;
  if (pagination) {
    query = withPagination(query, pagination.page, pagination.pageSize);
  }

  return query;
};

// UPDATE
export const updateNotificationByConditions = async <T extends NotificationSelectSchemaType>(
  payload: Partial<NotificationInsertSchemaType>,
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, notifications as any);
  });

  return db
    .update(notifications)
    .set(payload)
    .where(and(...whereClause));
};

// DELETE
export const deleteNotificationByConditions = async <T extends NotificationSelectSchemaType>(
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, notifications as any);
  });

  return db.delete(notifications).where(and(...whereClause));
};
