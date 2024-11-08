import { db } from '@/configs/database.config';
import {
  assets as assetModel,
  joinPosts,
  passPostItems,
  passPosts,
  postAssets,
  posts,
  rentalPosts,
  wantedPosts
} from '@/models/schema';
import { ConditionsType } from '@/types/drizzle.type';
import ApiError from '@/utils/ApiError.helper';
import { processCondition, processOrderCondition, selectOptions, withPagination } from '@/utils/schema.helper';
import { SQLWrapper, and, asc, desc, eq, sql } from 'drizzle-orm';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { postAssetsSchemaType, postSchemaType, rentalPostSchemaType } from './../types/schema.type';

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
  passPostItem?: PassPostItemType;
  distance?: number;
};

export type selectRentalPostByConditionType = PostType & RentalPostType;

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

// SELECT
export const selectPostById = async (postId: number) => {
  return db.select().from(posts).where(eq(posts.id, postId));
};

export const selectFullPostDetailById = async (
  postId: number,
  postType?: postSchemaType['type']
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
        query.leftJoin(passPosts, eq(passPosts.postId, posts.id)).$dynamic();
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
    const assets = rawData.map((row) => row.asset).filter((asset) => !!asset);

    let detail: fullPostResponseType['detail'];
    let passPostItem: PassPostItemType | undefined;

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
        passPostItem = rawData[0].passPostItem! as PassPostItemType;
        break;
      default:
        throw new Error('Unsupported post type');
    }

    const formattedData: fullPostResponseType[] = [
      {
        post,
        detail,
        assets,
        ...(post.type === 'pass' ? { passPostItem } : {})
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
        sql<number>`calculate_distance(${posts.addressLatitude},${posts.addressLongitude},${conditions?.addressLatitude?.value},${conditions?.addressLongitude?.value}) <= ${conditions?.radius}`
      );
    }

    let query = db
      .select({
        post: posts,
        asset: assetModel,
        rentalPost: rentalPosts,
        ...(hasLocationFilter && {
          distance: sql<number>`calculate_distance(${posts.addressLatitude},${posts.addressLongitude},${conditions?.addressLatitude?.value},${conditions?.addressLongitude?.value})`
        })
      })
      .from(posts)
      .leftJoin(postAssets, eq(postAssets.postId, posts.id))
      .leftJoin(assetModel, eq(assetModel.id, postAssets.assetId))
      .leftJoin(rentalPosts, eq(rentalPosts.postId, posts.id))
      .$dynamic();

    if (whereClause?.length) {
      query.where(and(...whereClause)).$dynamic();
    }

    if (options?.orderConditions) {
      const { orderConditions } = options;
      let orderClause = Object.entries(orderConditions).map(([field, direction]) => {
        return processOrderCondition(field, direction, { ...posts, ...rentalPosts } as any);
      });
      query = query.orderBy(...(orderClause as any));
    }

    const pagination = options?.pagination;
    query = withPagination(query, pagination?.page, pagination?.pageSize);

    console.log('QUERY ===>', query.toSQL());

    const rawData = await query;
    //
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
