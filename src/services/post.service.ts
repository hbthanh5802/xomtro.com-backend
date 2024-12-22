import { db } from '@/configs/database.config';
import {
  assets as assetModel,
  assets,
  joinPosts,
  passPostItems,
  passPosts,
  postAssets,
  posts,
  rentalPosts,
  userPostsInterested,
  wantedPosts
} from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import ApiError from '@/utils/ApiError.helper';
import { processCondition, processOrderCondition, selectOptions, withPagination } from '@/utils/schema.helper';
import { and, eq, getTableColumns, inArray, sql, SQLWrapper } from 'drizzle-orm';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import {
  AssetSelectSchemaType,
  joinPostSchemaType,
  passPostItemSchemaType,
  passPostSchemaType,
  postAssetsSchemaType,
  postSchemaType,
  PostSelectSchemaType,
  rentalPostSchemaType,
  UserPostInterestedSelectSchemaType,
  UserPostsInterestedInsertSchemaType,
  wantedPostSchemaType
} from './../types/schema.type';

// Type
type PostType = typeof posts.$inferSelect;
type RentalPostType = typeof rentalPosts.$inferSelect;
type WantedPostType = typeof wantedPosts.$inferSelect;
type JoinPostType = typeof joinPosts.$inferSelect;
type PassPostType = typeof passPosts.$inferSelect;
type PassPostItemType = typeof passPostItems.$inferSelect;
type AssetType = typeof assetModel.$inferSelect;
type fullPostResponseType = {
  post: PostType;
  detail: RentalPostType | WantedPostType | JoinPostType | PassPostType;
  assets: AssetType[];
  passItems?: PassPostItemType[];
  distance?: number;
};

export type selectRentalPostByConditionType = PostType & RentalPostType;
export type selectWantedPostByConditionType = PostType & WantedPostType;
export type selectJoinPostByConditionType = PostType & JoinPostType;
export type selectPassPostByConditionType = PostType & PassPostType & PassPostItemType;

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

export const insertWantedPost = async (payload: wantedPostSchemaType) => {
  return db.insert(wantedPosts).values(payload).$returningId();
};

export const insertJoinPost = async (payload: joinPostSchemaType) => {
  return db.insert(joinPosts).values(payload).$returningId();
};

export const insertPassPost = async (payload: passPostSchemaType) => {
  return db.insert(passPosts).values(payload).$returningId();
};

export const insertPassPostItem = async (payload: passPostItemSchemaType[] | passPostItemSchemaType) => {
  if (Array.isArray(payload)) {
    return db.insert(passPostItems).values(payload).$returningId();
  } else {
    return db.insert(passPostItems).values(payload).$returningId();
  }
};

export const insertUserPostInterested = async (payload: UserPostsInterestedInsertSchemaType) => {
  return db.insert(userPostsInterested).values(payload).$returningId();
};

// SELECT
export const selectPostById = async (postId: number) => {
  return db.select().from(posts).where(eq(posts.id, postId));
};

export const selectPostsByConditions = async <T extends PostSelectSchemaType>(conditions: ConditionsType<T>) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, posts as any);
  });

  return db
    .select()
    .from(posts)
    .where(and(...whereClause));
};

export const selectPostAssetsByPostId = async (postId: number) => {
  return db
    .select({ ...getTableColumns(assetModel) })
    .from(postAssets)
    .leftJoin(assetModel, eq(postAssets.assetId, assetModel.id))
    .where(eq(postAssets.postId, postId));
};

export const selectPassPostItemsByPostId = async (postId: number) => {
  return db
    .select({ ...getTableColumns(passPostItems) })
    .from(passPostItems)
    .where(eq(passPostItems.passPostId, postId));
};

export const selectFullPostDetailById = async (
  postId: number,
  postType: postSchemaType['type']
): Promise<fullPostResponseType[]> => {
  try {
    let query = db
      .select({
        post: posts,
        ...(postType === 'rental' && { rentalPost: rentalPosts }),
        ...(postType === 'wanted' && { wantedPost: wantedPosts }),
        ...(postType === 'join' && { joinPost: joinPosts }),
        ...(postType === 'pass' && { passPost: passPosts, passPostItem: passPostItems }),
        postAsset: postAssets,
        asset: assetModel
      })
      .from(posts)
      .$dynamic();
    //
    switch (postType) {
      case 'rental':
        query.leftJoin(rentalPosts, eq(rentalPosts.postId, posts.id)).$dynamic();
        break;
      case 'wanted':
        query.leftJoin(wantedPosts, eq(wantedPosts.postId, posts.id)).$dynamic();
        break;
      case 'join':
        query.leftJoin(joinPosts, eq(joinPosts.postId, posts.id)).$dynamic();
        break;
      case 'pass':
        query
          .leftJoin(passPosts, eq(passPosts.postId, posts.id))
          .leftJoin(passPostItems, eq(posts.id, passPostItems.passPostId))
          .$dynamic();
        break;
      default:
        break;
    }

    query
      .leftJoin(postAssets, eq(postAssets.postId, posts.id))
      .leftJoin(assetModel, eq(assetModel.id, postAssets.assetId));

    //
    const rawData = await query.where(eq(posts.id, postId));

    if (!rawData.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = rawData[0].post;
    let assets = rawData.map((row) => row.asset).filter((asset) => !!asset) as AssetSelectSchemaType[];
    const assetMap = new Map();
    assets.forEach((item) => assetMap.set(item.id as number, item));
    assets = Array.from(assetMap.values());

    let detail: fullPostResponseType['detail'];
    let passItems: fullPostResponseType['passItems'];

    switch (postType) {
      case 'rental':
        detail = rawData[0].rentalPost! as RentalPostType;
        break;
      case 'wanted':
        detail = rawData[0].wantedPost! as WantedPostType;
        break;
      case 'join':
        detail = rawData[0].joinPost! as JoinPostType;
        break;
      case 'pass':
        detail = rawData[0].passPost! as PassPostType;
        passItems = rawData.map((raw) => raw.passPostItem!).filter((passItem) => !!passItem) as PassPostItemType[];
        const map = new Map();
        passItems.forEach((item) => map.set(item.id, item));
        passItems = Array.from(map.values());
        break;
      default:
        throw new Error('Unsupported post type');
    }

    const formattedData: fullPostResponseType[] = [
      {
        post,
        detail,
        assets,
        ...(postType === 'pass' ? { passItems } : {})
      }
    ];

    return formattedData;
  } catch (error) {
    throw error;
  }
};

export const selectRentalPostByConditions = async <T extends selectRentalPostByConditionType & { radius?: number }>(
  conditions?: ConditionsType<T>,
  options?: selectOptions<selectRentalPostByConditionType>
) => {
  try {
    // Chuẩn bị `whereClause`
    let whereClause: (SQLWrapper | undefined)[] = [];
    if (conditions) {
      whereClause = Object.entries(conditions).map(([field, condition]) => {
        if (field !== 'addressLongitude' && field !== 'addressLatitude' && field !== 'radius') {
          return processCondition(field, condition, { ...posts, ...rentalPosts } as any);
        }
      });
    }

    const hasLocationFilter = Boolean(
      conditions?.addressLongitude && conditions?.addressLatitude && conditions?.radius
    );

    if (hasLocationFilter) {
      whereClause.push(
        sql<number>`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2))) <= ${conditions?.radius}`
      );
    }

    // Xử lý order conditions
    let orderClause: SQLWrapper[] = [];
    if (options?.orderConditions) {
      const { orderConditions } = options;
      orderClause = Object.entries(orderConditions).map(([field, direction]) => {
        return processOrderCondition(field, direction, { ...posts, ...rentalPosts } as any);
      });
    }

    // BƯỚC 1: Lấy danh sách `post.id` theo pagination
    const pagination = options?.pagination;
    let postIdsQuery = db
      .select({ id: posts.id })
      .from(posts)
      .leftJoin(rentalPosts, eq(rentalPosts.postId, posts.id))
      .$dynamic();

    if (whereClause.length) {
      postIdsQuery = postIdsQuery.where(and(...whereClause)).$dynamic();
    }
    if (orderClause.length) {
      postIdsQuery = postIdsQuery.orderBy(...(orderClause as any)).$dynamic();
    }
    if (options?.pagination) {
      postIdsQuery = withPagination(postIdsQuery, pagination?.page, pagination?.pageSize);
    }
    const postIds = (await postIdsQuery).map((p) => p.id);

    if (!postIds.length) {
      // Không có kết quả phù hợp
      return [];
    }

    // BƯỚC 2: JOIN các bảng liên quan dựa trên danh sách `post.id`
    let query = db
      .select({
        post: posts,
        asset: assetModel,
        rentalPost: rentalPosts,
        ...(hasLocationFilter && {
          distance: sql<number>`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2)))`
        })
      })
      .from(posts)
      .leftJoin(postAssets, eq(postAssets.postId, posts.id))
      .leftJoin(assetModel, eq(assetModel.id, postAssets.assetId))
      .leftJoin(rentalPosts, eq(rentalPosts.postId, posts.id))
      .where(inArray(posts.id, postIds))
      .$dynamic();

    if (hasLocationFilter) {
      orderClause.unshift(
        sql`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2))) asc`
      );
    }

    if (orderClause.length) {
      query = query.orderBy(...(orderClause as any)).$dynamic();
    }

    const rawData = await query;

    // Xử lý kết quả: Gom nhóm `assets` theo từng `post`
    const formattedResponse: fullPostResponseType[] = rawData.reduce((acc, item) => {
      let postResponseItem = acc.find((p) => p.post.id === item.post.id);
      if (!postResponseItem) {
        postResponseItem = {
          assets: [],
          detail: item.rentalPost!,
          post: item.post,
          distance: item.distance
        };
        acc.push(postResponseItem);
      }
      if (item.asset) postResponseItem.assets.push(item.asset);

      return acc;
    }, [] as fullPostResponseType[]);

    return formattedResponse;
  } catch (error) {
    throw error;
  }
};

export const selectJoinPostByConditions = async <T extends selectJoinPostByConditionType & { radius?: number }>(
  conditions?: ConditionsType<T>,
  options?: selectOptions<selectJoinPostByConditionType>
) => {
  try {
    let whereClause: (SQLWrapper | undefined)[] = [];
    if (conditions) {
      whereClause = Object.entries(conditions).map(([field, condition]) => {
        if (field !== 'addressLongitude' && field !== 'addressLatitude' && field !== 'radius') {
          return processCondition(field, condition, { ...posts, ...joinPosts } as any);
        }
      });
    }

    const hasLocationFilter = Boolean(
      conditions?.addressLongitude && conditions?.addressLatitude && conditions?.radius
    );

    if (hasLocationFilter) {
      whereClause.push(
        sql<number>`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2))) <= ${conditions?.radius}`
      );
    }

    // Xử lý order conditions
    let orderClause: SQLWrapper[] = [];
    if (options?.orderConditions) {
      const { orderConditions } = options;
      orderClause = Object.entries(orderConditions).map(([field, direction]) => {
        return processOrderCondition(field, direction, { ...posts, ...joinPosts } as any);
      });
    }

    // BƯỚC 1: Lấy danh sách `post.id` theo pagination
    const pagination = options?.pagination;
    let postIdsQuery = db
      .select({ id: posts.id })
      .from(posts)
      .leftJoin(joinPosts, eq(joinPosts.postId, posts.id))
      .$dynamic();

    if (whereClause.length) {
      postIdsQuery = postIdsQuery.where(and(...whereClause)).$dynamic();
    }
    if (orderClause.length) {
      postIdsQuery = postIdsQuery.orderBy(...(orderClause as any)).$dynamic();
    }
    if (options?.pagination) {
      postIdsQuery = withPagination(postIdsQuery, pagination?.page, pagination?.pageSize);
    }

    const postIds = (await postIdsQuery).map((p) => p.id);

    if (!postIds.length) {
      // Không có kết quả phù hợp
      return [];
    }

    let query = db
      .select({
        post: posts,
        asset: assetModel,
        joinPost: joinPosts,
        ...(hasLocationFilter && {
          distance: sql<number>`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2)))`
        })
      })
      .from(posts)
      .leftJoin(postAssets, eq(postAssets.postId, posts.id))
      .leftJoin(assetModel, eq(assetModel.id, postAssets.assetId))
      .leftJoin(joinPosts, eq(joinPosts.postId, posts.id))
      .where(inArray(posts.id, postIds))
      .$dynamic();

    if (hasLocationFilter) {
      orderClause.unshift(
        sql`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2))) asc`
      );
    }
    if (orderClause.length) {
      query = query.orderBy(...(orderClause as any)).$dynamic();
    }

    const rawData = await query;
    //
    const formattedResponse: fullPostResponseType[] = rawData.reduce((acc, item) => {
      let postResponseItem = acc.find((p) => p.post.id === item.post.id);
      if (!postResponseItem) {
        postResponseItem = {
          assets: [],
          detail: item.joinPost!,
          post: item.post,
          distance: item.distance
        };
        acc.push(postResponseItem);
      }
      if (item.asset) postResponseItem.assets.push(item.asset);

      return acc;
    }, [] as fullPostResponseType[]);

    return formattedResponse;
  } catch (error) {
    throw error;
  }
};

export const selectWantedPostByConditions = async <T extends selectWantedPostByConditionType & { radius?: number }>(
  conditions?: ConditionsType<T>,
  options?: selectOptions<selectWantedPostByConditionType>
) => {
  try {
    let whereClause: (SQLWrapper | undefined)[] = [];
    if (conditions) {
      whereClause = Object.entries(conditions).map(([field, condition]) => {
        if (field !== 'addressLongitude' && field !== 'addressLatitude' && field !== 'radius') {
          return processCondition(field, condition, { ...posts, ...wantedPosts } as any);
        }
      });
    }

    const hasLocationFilter = Boolean(
      conditions?.addressLongitude && conditions?.addressLatitude && conditions?.radius
    );

    if (hasLocationFilter) {
      whereClause.push(
        sql<number>`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2))) <= ${conditions?.radius}`
      );
    }

    // Xử lý order conditions
    let orderClause: SQLWrapper[] = [];
    if (options?.orderConditions) {
      const { orderConditions } = options;
      orderClause = Object.entries(orderConditions).map(([field, direction]) => {
        return processOrderCondition(field, direction, { ...posts, ...wantedPosts } as any);
      });
    }

    // BƯỚC 1: Lấy danh sách `post.id` theo pagination
    const pagination = options?.pagination;
    let postIdsQuery = db
      .select({ id: posts.id })
      .from(posts)
      .leftJoin(wantedPosts, eq(wantedPosts.postId, posts.id))
      .$dynamic();

    if (whereClause.length) {
      postIdsQuery = postIdsQuery.where(and(...whereClause)).$dynamic();
    }
    if (orderClause.length) {
      postIdsQuery = postIdsQuery.orderBy(...(orderClause as any)).$dynamic();
    }
    if (options?.pagination) {
      postIdsQuery = withPagination(postIdsQuery, pagination?.page, pagination?.pageSize);
    }

    const postIds = (await postIdsQuery).map((p) => p.id);

    if (!postIds.length) {
      // Không có kết quả phù hợp
      return [];
    }

    let query = db
      .select({
        post: posts,
        asset: assetModel,
        wantedPost: wantedPosts,
        ...(hasLocationFilter && {
          distance: sql<number>`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2)))`
        })
      })
      .from(posts)
      .leftJoin(postAssets, eq(postAssets.postId, posts.id))
      .leftJoin(assetModel, eq(assetModel.id, postAssets.assetId))
      .leftJoin(wantedPosts, eq(wantedPosts.postId, posts.id))
      .where(inArray(posts.id, postIds))
      .$dynamic();

    if (hasLocationFilter) {
      orderClause.unshift(
        sql`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2))) asc`
      );
    }
    if (orderClause.length) {
      query = query.orderBy(...(orderClause as any)).$dynamic();
    }

    const rawData = await query;

    const formattedResponse: fullPostResponseType[] = rawData.reduce((acc, item) => {
      let postResponseItem = acc.find((p) => p.post.id === item.post.id);
      if (!postResponseItem) {
        postResponseItem = {
          assets: [],
          detail: item.wantedPost!,
          post: item.post,
          distance: item.distance
        };
        acc.push(postResponseItem);
      }
      if (item.asset) postResponseItem.assets.push(item.asset);

      return acc;
    }, [] as fullPostResponseType[]);

    return formattedResponse;
  } catch (error) {
    throw error;
  }
};

export const selectPassPostByConditions = async <T extends selectPassPostByConditionType & { radius?: number }>(
  conditions?: ConditionsType<T>,
  options?: selectOptions<selectPassPostByConditionType>
) => {
  try {
    let whereClause: (SQLWrapper | undefined)[] = [];
    if (conditions) {
      whereClause = Object.entries(conditions).map(([field, condition]) => {
        if (field !== 'addressLongitude' && field !== 'addressLatitude' && field !== 'radius') {
          return processCondition(field, condition, { ...posts, ...passPosts, ...passPostItems } as any);
        }
      });
    }

    const hasLocationFilter = Boolean(
      conditions?.addressLongitude && conditions?.addressLatitude && conditions?.radius
    );

    if (hasLocationFilter) {
      whereClause.push(
        sql<number>`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2))) <= ${conditions?.radius}`
      );
    }

    // Xử lý order conditions
    let orderClause: SQLWrapper[] = [];
    if (options?.orderConditions) {
      const { orderConditions } = options;
      orderClause = Object.entries(orderConditions).map(([field, direction]) => {
        return processOrderCondition(field, direction, { ...posts, ...passPosts, ...passPostItems } as any);
      });
    }

    // BƯỚC 1: Lấy danh sách `post.id` theo pagination
    const pagination = options?.pagination;
    let postIdsQuery = db
      .select({ id: posts.id })
      .from(posts)
      .leftJoin(passPosts, eq(passPosts.postId, posts.id))
      .$dynamic();

    if (whereClause.length) {
      postIdsQuery = postIdsQuery.where(and(...whereClause)).$dynamic();
    }
    if (orderClause.length) {
      postIdsQuery = postIdsQuery.orderBy(...(orderClause as any)).$dynamic();
    }
    if (options?.pagination) {
      postIdsQuery = withPagination(postIdsQuery, pagination?.page, pagination?.pageSize);
    }

    const postIds = (await postIdsQuery).map((p) => p.id);
    if (!postIds.length) {
      // Không có kết quả phù hợp
      return [];
    }

    let query = db
      .select({
        post: posts,
        asset: assetModel,
        passPost: passPosts,
        passItem: passPostItems,
        ...(hasLocationFilter && {
          distance: sql<number>`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2)))`
        })
      })
      .from(posts)
      .leftJoin(postAssets, eq(postAssets.postId, posts.id))
      .leftJoin(assetModel, eq(assetModel.id, postAssets.assetId))
      .leftJoin(passPosts, eq(passPosts.postId, posts.id))
      .leftJoin(passPostItems, eq(passPostItems.passPostId, posts.id))
      .where(inArray(posts.id, postIds))
      .$dynamic();

    if (hasLocationFilter) {
      orderClause.unshift(
        sql`6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS(${posts.addressLatitude}) - RADIANS(${conditions?.addressLatitude?.value})) / 2, 2) + COS(RADIANS(${posts.addressLatitude})) * COS(RADIANS(${conditions?.addressLatitude?.value})) * POW(SIN(RADIANS(${posts.addressLongitude}) - RADIANS(${conditions?.addressLongitude?.value})) / 2, 2))) asc`
      );
    }
    if (orderClause.length) {
      query = query.orderBy(...(orderClause as any)).$dynamic();
    }

    const rawData = await query;
    //
    const formattedResponse: fullPostResponseType[] = rawData.reduce((acc, item) => {
      // Tìm kiếm bài post trong danh sách kết quả
      let postResponseItem = acc.find((p) => p.post.id === item.post.id);

      if (!postResponseItem) {
        // Nếu không tìm thấy, tạo mới và thêm vào acc
        postResponseItem = {
          assets: [],
          post: item.post,
          detail: item.passPost!,
          passItems: [],
          distance: item.distance
        };
        acc.push(postResponseItem);
      }

      // Gộp asset (nếu có)
      if (item.asset) {
        const assetExists = postResponseItem.assets.some((a) => a.id === item.asset?.id);
        if (!assetExists) postResponseItem.assets.push(item.asset);
      }

      // Gộp passItem (nếu có)
      if (item.passItem) {
        const passItemExists = postResponseItem?.passItems?.some((p) => p.id === item?.passItem?.id);
        if (!passItemExists) postResponseItem?.passItems?.push(item.passItem);
      }

      return acc;
    }, [] as fullPostResponseType[]);

    return formattedResponse;
  } catch (error) {
    throw error;
  }
};

export const selectInterestedUserPostByConditions = async <T extends UserPostInterestedSelectSchemaType>(
  conditions?: ConditionsType<T>,
  options?: selectOptions<T>
) => {
  let whereClause: (SQLWrapper | undefined)[] = [];
  let orderClause: (SQLWrapper | undefined)[] = [];

  if (conditions) {
    whereClause = Object.entries(conditions).map(([field, condition]) => {
      return processCondition(field, condition, userPostsInterested as any);
    });
  }
  if (options?.orderConditions) {
    orderClause = Object.entries(options.orderConditions).map(([field, condition]) => {
      return processOrderCondition(field, condition, userPostsInterested as any);
    });
  }

  let query = db.select().from(userPostsInterested).$dynamic();
  if (whereClause.length) {
    query = query.where(and(...whereClause)).$dynamic();
  }
  if (orderClause.length) {
    query = query.orderBy(...(orderClause as any));
  }

  return query;
};
// UPDATE
export const updatePostById = async (postId: number, payload: Partial<postSchemaType>) => {
  return db.update(posts).set(payload).where(eq(posts.id, postId));
};

export const updatePostByConditions = async <T extends postSchemaType>(
  payload: Partial<T>,
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, posts as any);
  });

  return db
    .update(posts)
    .set(payload)
    .where(and(...whereClause));
};

export const updateRentalPostByPostId = async (postId: number, payload: Partial<rentalPostSchemaType>) => {
  return db.update(rentalPosts).set(payload).where(eq(rentalPosts.postId, postId));
};

export const updateWantedPostByPostId = async (postId: number, payload: Partial<wantedPostSchemaType>) => {
  return db.update(wantedPosts).set(payload).where(eq(wantedPosts.postId, postId));
};

export const updateJoinPostByPostId = async (postId: number, payload: Partial<joinPostSchemaType>) => {
  return db.update(joinPosts).set(payload).where(eq(joinPosts.postId, postId));
};

export const updatePassPostByPostId = async (postId: number, payload: Partial<passPostSchemaType>) => {
  return db.update(passPosts).set(payload).where(eq(passPosts.postId, postId));
};

export const updatePassPostItemById = async (passItemId: number, payload: Partial<passPostItemSchemaType>) => {
  return db.update(passPostItems).set(payload).where(eq(passPostItems.id, passItemId));
};

// DELETE
export const deletePostById = async (postId: number) => {
  return db.delete(posts).where(eq(posts.id, postId));
};

export const deletePostAssets = async (postId: number, assetIds: number[] | number) => {
  if (Array.isArray(assetIds)) {
    return db.delete(assets).where(and(inArray(assets.id, assetIds), eq(assets.postId, postId)));
  } else {
    return db.delete(assets).where(and(eq(assets.id, assetIds), eq(assets.postId, postId)));
  }
};

export const removeAllPassPostItemByPostId = async (postId: number) => {
  return db.delete(passPostItems).where(eq(passPostItems.passPostId, postId));
};

export const deleteManyPassPostItems = async (postId: number, passPostItemIds: number[]) => {
  return db
    .delete(passPostItems)
    .where(and(eq(passPostItems.passPostId, postId), inArray(passPostItems.id, passPostItemIds)));
};

export const deleteUserPostInterestByConditions = async <T extends UserPostsInterestedInsertSchemaType>(
  conditions: ConditionsType<T>
) => {
  const whereClause = Object.entries(conditions).map(([field, condition]) => {
    return processCondition(field, condition, userPostsInterested as any);
  });

  return db.delete(userPostsInterested).where(and(...whereClause));
};
