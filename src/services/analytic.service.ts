import { db } from '@/configs/database.config';
import { posts } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { PostSelectSchemaType } from '@/types/schema.type';
import { customCount, processCondition } from '@/utils/schema.helper';
import { and, desc } from 'drizzle-orm';

// POSTS
export const selectPostsCountByTypeWithPostConditions = async <T extends PostSelectSchemaType>(
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, posts as any);
  });

  let query = db
    .select({
      type: posts.type,
      totalPosts: customCount(posts.type),
      ...(conditions.ownerId && { ownerId: posts.ownerId })
    })
    .from(posts)
    .$dynamic();

  if (whereClause.length) {
    query = query.where(and(...whereClause)).$dynamic();
  }
  query = query.groupBy(posts.type).orderBy(desc(customCount(posts.type)));

  // console.log(query.toSQL());
  return query;
};
