import { db } from '@/configs/database.config';
import { messages } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { MessageInsertSchemaType, MessageSelectSchemaType } from '@/types/schema.type';
import { PaginationConditionType, processCondition, withPagination } from '@/utils/schema.helper';
import { and, asc, eq } from 'drizzle-orm';

// INSERT
export const insertMessage = async (payload: MessageInsertSchemaType) => {
  return db.insert(messages).values(payload).$returningId();
};

// SELECT
export const selectMessageByConditions = async <T extends MessageSelectSchemaType>(conditions: ConditionsType<T>) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, messages as any);
  });

  return db
    .select()
    .from(messages)
    .where(and(...whereClause));
};

export const selectMessagesOfChatId = async (chatId: number, paginationCondition?: PaginationConditionType) => {
  let q = db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(asc(messages.sentAt)).$dynamic();
  const { page, pageSize } = paginationCondition ?? {};
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
