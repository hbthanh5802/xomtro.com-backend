import { db } from '@/configs/database.config';
import { postCommentClosures, postComments } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { PostCommentInsertSchemaType, PostCommentSelectSchemaType } from '@/types/schema.type';
import { processCondition, processOrderCondition, selectOptions, withPagination } from '@/utils/schema.helper';
import { aliasedTable, and, eq, getTableColumns, isNull, sql, SQLWrapper } from 'drizzle-orm';
import { ResultSetHeader } from 'mysql2';

// INSERT
type InsertCommentResult = [[PostCommentSelectSchemaType[]], ResultSetHeader];
export const insertComment = async (payload: PostCommentInsertSchemaType): Promise<InsertCommentResult> => {
  const query = sql<PostCommentSelectSchemaType>`CALL add_post_comment(
      ${payload.ownerId},
      ${payload.content},
      ${payload.tags || null},
      ${payload.postId},
      ${payload.parentCommentId || null}
  )`;

  const result = (await db.execute(query)) as unknown as InsertCommentResult; // cast
  return result;
};

// SELECT
export const selectPostLevel1Comments = async (postId: number, options: selectOptions<PostCommentSelectSchemaType>) => {
  let query = db
    .select()
    .from(postComments)
    .where(and(eq(postComments.postId, postId), isNull(postComments.parentCommentId)))
    .$dynamic();

  let orderClause: SQLWrapper[] = [];
  if (options?.orderConditions) {
    const { orderConditions } = options;
    orderClause = Object.entries(orderConditions).map(([field, direction]) => {
      return processOrderCondition(field, direction, postComments as any);
    });
  }
  if (orderClause.length) {
    query = query.orderBy(...(orderClause as any)).$dynamic();
  }

  const { page, pageSize } = options?.pagination ?? {};
  query = withPagination(query, page ?? 1, pageSize ?? 10);
  return query;
};

export const selectCommentByConditions = async <T extends PostCommentSelectSchemaType>(
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, postComments as any);
  });

  return db
    .select()
    .from(postComments)
    .where(and(...whereClause));
};

export const selectDirectChildCommentsFromParentCommentId = async <T extends PostCommentSelectSchemaType>(
  conditions: ConditionsType<T>,
  options: selectOptions<T>
) => {
  const c = aliasedTable(postComments, 'c');
  const pc = aliasedTable(postCommentClosures, 'pc');

  let query = db
    .select({ ...getTableColumns(c) })
    .from(c)
    .leftJoin(pc, eq(pc.descendantId, c.id))
    .$dynamic();

  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, c as any);
  });

  if (whereClause.length) {
    query = query.where(and(...whereClause, eq(pc.depth, 1))).$dynamic();
  }

  let orderClause: SQLWrapper[] = [];
  if (options?.orderConditions) {
    const { orderConditions } = options;
    orderClause = Object.entries(orderConditions).map(([field, direction]) => {
      return processOrderCondition(field, direction, postComments as any);
    });
  }
  if (orderClause.length) {
    query = query.orderBy(...(orderClause as any)).$dynamic();
  }

  const { page, pageSize } = options?.pagination ?? {};
  query = withPagination(query, page ?? 1, pageSize ?? 10);

  return query;
};

// UPDATE
export const updateCommentByCommentId = async (commentId: number, payload: Partial<PostCommentInsertSchemaType>) => {
  return db.update(postComments).set(payload).where(eq(postComments.id, commentId));
};

// DELETE
export const deleteCommentByConditions = async <T extends PostCommentSelectSchemaType>(
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, postComments as any);
  });

  return db.delete(postComments).where(and(...whereClause));
};
