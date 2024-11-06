import { db } from '@/configs/database.config';
import { postAssets, posts, rentalPosts } from '@/models/schema';
import { postAssetsSchemaType, postSchemaType, rentalPostSchemaType } from './../types/schema.type';

// INSERT
export const insertPost = async (payload: postSchemaType) => {
  return db.insert(posts).values(payload).$returningId();
};

export const insertPostAssets = async (payload: postAssetsSchemaType[] | postAssetsSchemaType) => {
  if (Array.isArray(payload)) {
    return db.insert(postAssets).values(payload).$returningId();
  } else {
    return db.insert(postAssets).values(payload).$returningId();
  }
};

export const insertRentalPost = async (payload: rentalPostSchemaType) => {
  return db.insert(rentalPosts).values(payload).$returningId();
};
