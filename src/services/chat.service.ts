import { db } from '@/configs/database.config';
import { chatMembers, chats, userDetail } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { ChatInsertSchemaType, ChatMemberInsertSchemaType, ChatMemberSelectSchemaType } from '@/types/schema.type';
import { processCondition } from '@/utils/schema.helper';
import { aliasedTable, and, eq, getTableColumns, ne } from 'drizzle-orm';

// INSERT
export const insertChat = async (payload: ChatInsertSchemaType) => {
  return db.insert(chats).values(payload).$returningId();
};

export const insertChatMembers = async (payload: ChatMemberInsertSchemaType[]) => {
  return db.insert(chatMembers).values(payload).$returningId();
};

// SELECT
export const selectChatIdBetweenTwoUserId = async (userA: number, userB: number) => {
  const cm1 = aliasedTable(chatMembers, 'cm1');
  const cm2 = aliasedTable(chatMembers, 'cm2');
  return db
    .select({ ...getTableColumns(chats) })
    .from(chats)
    .leftJoin(cm1, eq(chats.id, cm1.chatId))
    .leftJoin(cm2, eq(chats.id, cm2.chatId))
    .where(and(eq(cm1.userId, userA), eq(cm2.userId, userB), eq(chats.type, 'individual')));
};

export const selectChatById = async (chatId: number) => {
  return db.select().from(chats).where(eq(chats.id, chatId));
};

export const selectChatMemberByConditions = async <T extends ChatMemberSelectSchemaType>(
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, chatMembers as any);
  });

  return db
    .select({
      ...getTableColumns(chatMembers),
      email: userDetail.email,
      firstName: userDetail.firstName,
      lastName: userDetail.lastName
    })
    .from(chatMembers)
    .leftJoin(userDetail, eq(chatMembers.userId, userDetail.userId))
    .where(and(...whereClause));
};

// SELECT cm2.*
// FROM chat_members cm1
// JOIN chats c ON cm1.chat_id = c.id
// JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id AND cm1.user_id != cm2.user_id
// WHERE cm1.user_id = 1 AND c.type = 'individual';
export const selectIndividualChatsByUserId = async (userId: number) => {
  const cm1 = aliasedTable(chatMembers, 'cm1');
  const cm2 = aliasedTable(chatMembers, 'cm2');
  const q = db
    .select({ ...getTableColumns(cm2) })
    .from(cm1)
    .leftJoin(chats, eq(cm1.chatId, chats.id))
    .leftJoin(cm2, and(eq(cm1.chatId, cm2.chatId), ne(cm1.userId, cm2.userId)))
    .where(and(eq(cm1.userId, userId), eq(chats.type, 'individual')));

  return q;
};

// UPDATE
export const updateChatMemberByConditions = async <T extends ChatMemberSelectSchemaType>(
  payload: Partial<ChatMemberInsertSchemaType>,
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, chatMembers as any);
  });

  return db
    .update(chatMembers)
    .set(payload)
    .where(and(...whereClause));
};
