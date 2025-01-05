import { db } from '@/configs/database.config';
import { joinPosts, posts, rentalPosts, wantedPosts } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { PostSelectSchemaType } from '@/types/schema.type';
import { customCount, processCondition } from '@/utils/schema.helper';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

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

  return query;
};

export type SelectPostAnalyticConditionType = {
  totalAreaStart?: number;
  totalAreaEnd?: number;
  year: number;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  type: 'rental' | 'wanted' | 'join';
};
export const selectRentalPostAnalyticByConditions = async (conditions: SelectPostAnalyticConditionType) => {
  const detailTableInstance =
    conditions.type === 'rental' ? rentalPosts : conditions.type === 'wanted' ? wantedPosts : joinPosts;
  let query = db
    .select({
      month: sql<number>`MONTH(${posts.updatedAt})`,
      avgPrice: sql<number>`ROUND(AVG((${detailTableInstance.priceStart}+${detailTableInstance.priceEnd})/2),-3)`
    })
    .from(posts)
    .leftJoin(detailTableInstance, eq(posts.id, detailTableInstance.postId))
    .$dynamic();

  const whereConditions = [];
  if (conditions.totalAreaStart) {
    whereConditions.push(gte(detailTableInstance.totalArea, conditions.totalAreaStart));
  }
  if (conditions.totalAreaEnd) {
    whereConditions.push(lte(detailTableInstance.totalArea, conditions.totalAreaEnd));
  }
  if (conditions.provinceName) {
    whereConditions.push(eq(posts.addressProvince, conditions.provinceName));
  }
  if (conditions.districtName) {
    whereConditions.push(eq(posts.addressDistrict, conditions.districtName));
  }
  if (conditions.wardName) {
    whereConditions.push(eq(posts.addressWard, conditions.wardName));
  }
  if (conditions.year) {
    whereConditions.push(sql`YEAR(${posts.updatedAt})=${conditions.year}`);
  }
  if (whereConditions.length) {
    query = query.where(and(...whereConditions)).$dynamic();
  }

  query = query.groupBy(sql`MONTH(${posts.updatedAt})`).orderBy(sql`month(${posts.updatedAt})`);

  return query;
};
