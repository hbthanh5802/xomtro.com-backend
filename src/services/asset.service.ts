import { db } from '@/configs/database.config';
import { assets } from '@/models/schema';
import { Condition, ConditionsType } from '@/types/drizzle.type';
import { assetSchemaType } from '@/types/schema.type';
import { processCondition } from '@/utils/schema.helper';
import { and, eq } from 'drizzle-orm';
import { queryOptions, withPagination } from './../utils/schema.helper';

// INSERT
export const insertAsset = async (payload: assetSchemaType | assetSchemaType[]) => {
  if (Array.isArray(payload)) {
    return db.insert(assets).values(payload).$returningId();
  } else {
    return db.insert(assets).values(payload).$returningId();
  }
};

// UPDATE
export const updateAssetById = async (assetId: number, payload: Partial<assetSchemaType>) => {
  return db.update(assets).set(payload).where(eq(assets.id, assetId)).limit(1);
};

// SELECT
export const selectAssetById = async (assetId: number) => {
  return db.select().from(assets).where(eq(assets.id, assetId)).limit(1);
};

export const selectAssetsByConditions = async <T extends assetSchemaType>(
  conditions: ConditionsType<T>,
  options?: queryOptions<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field as keyof T, condition as Condition<T, keyof T>, assets as any);
  });

  let query = db
    .select()
    .from(assets)
    .where(and(...whereClause))
    .$dynamic();

  if (options && options.pageSize) {
    query = withPagination(query, options.page, options.pageSize);
  }

  return query;
};
