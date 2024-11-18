import { db } from '@/configs/database.config';
import { addresses } from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import { addressSchemaType } from '@/types/schema.type';
import { processCondition } from '@/utils/schema.helper';
import { and, eq } from 'drizzle-orm';

// INSERT
export const insertAddress = async (payload: addressSchemaType) => {
  return db.insert(addresses).values(payload).$returningId();
};

// SELECT
export const searchAddressByConditions = async <T extends addressSchemaType>(conditions: ConditionsType<T>) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, addresses as any);
  });

  return db
    .select()
    .from(addresses)
    .where(and(...whereClause));
};

// UPDATE
export const updateAddressById = async (addressId: number, payload: Partial<addressSchemaType>) => {
  return db.update(addresses).set(payload).where(eq(addresses.id, addressId));
};

export const updateAddressByConditions = async <T extends addressSchemaType>(
  payload: Partial<T>,
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, addresses as any);
  });

  return db
    .update(addresses)
    .set(payload)
    .where(and(...whereClause));
};

// DELETE
export const deleteAddressById = async (addressId: number) => {
  return db.delete(addresses).where(eq(addresses.id, addressId)).limit(1);
};

export const deleteAddressByConditions = async <T extends addressSchemaType>(conditions: ConditionsType<T>) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, addresses as any);
  });

  return db.delete(addresses).where(and(...whereClause));
};
