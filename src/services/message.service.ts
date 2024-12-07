import { db } from '@/configs/database.config';
import { messages } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { MessageInsertSchemaType, MessageSelectSchemaType } from '@/types/schema.type';
import { processCondition, processOrderCondition, selectOptions, withPagination } from '@/utils/schema.helper';
import { and, eq, SQLWrapper } from 'drizzle-orm';

// INSERT
export const insertMessage = async (payload: MessageInsertSchemaType) => {
  return db.insert(messages).values(payload).$returningId();
};

// SELECT
export const selectMessageByConditions = async <T extends MessageSelectSchemaType>(
  conditions: ConditionsType<T>,
  limit?: number
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, messages as any);
  });

  let q = db
    .select()
    .from(messages)
    .where(and(...whereClause))
    .$dynamic();
  if (limit) {
    q = q.limit(limit);
  }

  return q;
};

export const selectMessagesOfChatId = async (chatId: number, options?: selectOptions<MessageSelectSchemaType>) => {
  // Xử lý order conditions
  let q = db.select().from(messages).where(eq(messages.chatId, chatId)).$dynamic();

  let orderClause: SQLWrapper[] = [];
  if (options?.orderConditions) {
    const { orderConditions } = options;
    orderClause = Object.entries(orderConditions).map(([field, direction]) => {
      return processOrderCondition(field, direction, messages as any);
    });
  }
  if (orderClause.length) {
    q = q.orderBy(...(orderClause as any)).$dynamic();
  }

  const { page, pageSize } = options?.pagination ?? {};
  q = withPagination(q, page ?? 1, pageSize ?? 15);
  return q;
};

// UPDATE
export const updateMessageByConditions = async <T extends MessageSelectSchemaType>(
  payload: Partial<MessageInsertSchemaType>,
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, messages as any);
  });

  return db
    .update(messages)
    .set(payload)
    .where(and(...whereClause));
};
