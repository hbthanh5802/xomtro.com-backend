import { insertAsset } from '@/services/asset.service';
import { uploadImage } from '@/services/fileUpload.service';
import { geocodingByDistanceMatrix, geocodingByGeocodeMap } from '@/services/location.service';
import {
  insertPost,
  insertPostAssets,
  insertRentalPost,
  insertWantedPost,
  selectFullPostDetailById,
  selectPostById,
  selectRentalPostByConditionType,
  selectRentalPostByConditions
} from '@/services/post.service';
import { ConditionsType } from '@/types/drizzle.type';
import {
  assetSchemaType,
  assetType,
  postAssetsSchemaType,
  postSchemaType,
  postType,
  rentalPostSchemaType,
  wantedPostSchemaType
} from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { generateFileName } from '@/utils/file.helper';
import { paginationHelper, selectOptions } from '@/utils/schema.helper';
import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const uploadPostImageHandler = async (req: Request) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'File is not invalid');
    }
    const files = req.files as Express.Multer.File[];
    const results: { success: UploadApiResponse[]; error: any[] } = { success: [], error: [] };
    // Prepare file detail
    const fileDetails = files.filter((file) => file.mimetype.split('/')[0] === 'image');

    await Promise.all(
      fileDetails.map(async (file) => {
        try {
          const result = await uploadImage(file, { folder: 'posts' });
          results.success.push(result);
        } catch (error: any) {
          results.error.push({
            file: file.originalname,
            message: error.message
          });
        }
      })
    );

    return results;
  } catch (error) {
    throw error;
  }
};

export const insertPostAssetsHandler = async (
  payload: UploadApiResponse[],
  ownerInfo: { userId: number; postId: number }
) => {
  try {
    if (!payload.length) return [];

    const insertAssetPayload: assetSchemaType[] = payload.map((file) => {
      const { public_id, url, resource_type, format } = file;
      return {
        userId: ownerInfo.userId,
        postId: ownerInfo.postId,
        url: url,
        name: public_id,
        format,
        type: resource_type as assetType,
        tags: JSON.stringify(['post'])
      };
    });
    const insertAssetResult = await insertAsset(insertAssetPayload);

    const insertPostAssetPayload: postAssetsSchemaType[] = insertAssetResult.map(({ id }) => {
      return { postId: ownerInfo.postId, assetId: id };
    });
    await insertPostAssets(insertPostAssetPayload);
  } catch (error) {
    throw error;
  }
};

export const createRentalPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let {
      title,
      type,
      description,
      addressProvince,
      addressDistrict,
      addressWard,
      addressDetail,
      expirationAfter,
      expirationAfterUnit,
      addressLongitude,
      addressLatitude,
      note,
      priceStart,
      priceEnd,
      priceUnit,
      minLeaseTerm,
      minLeaseTermUnit,
      hasFurniture,
      hasAirConditioner,
      hasWashingMachine,
      hasRefrigerator,
      hasPrivateBathroom,
      hasParking,
      hasSecurity,
      hasElevator,
      allowPets
    } = req.body;
    const currentUser = req.currentUser!;
    const { users, users_detail } = currentUser;

    if (!addressLatitude || !addressLongitude) {
      const address = `${addressWard} ${addressDistrict} ${addressProvince}`;
      const getGeoCodingResult = await geocodingByGeocodeMap(address);
      addressLatitude = getGeoCodingResult.latitude;
      addressLongitude = getGeoCodingResult.longitude;
    }

    const insertPostPayload: postSchemaType = {
      ownerId: users.id,
      type: 'rental',
      title,
      note,
      description,
      addressProvince,
      addressDistrict,
      addressWard,
      addressDetail,
      addressLongitude,
      addressLatitude,
      expirationAfter,
      expirationAfterUnit
    };
    const insertPostResult = await insertPost(insertPostPayload);
    const { id: postId } = insertPostResult[0];

    const insertRentalPostPayload: rentalPostSchemaType = {
      postId,
      priceStart,
      priceEnd,
      priceUnit,
      minLeaseTerm,
      minLeaseTermUnit,
      hasFurniture: !!Number(hasFurniture),
      hasAirConditioner: !!Number(hasAirConditioner),
      hasWashingMachine: !!Number(hasWashingMachine),
      hasRefrigerator: !!Number(hasRefrigerator),
      hasPrivateBathroom: !!Number(hasPrivateBathroom),
      hasParking: !!Number(hasParking),
      hasSecurity: !!Number(hasSecurity),
      hasElevator: !!Number(hasElevator),
      allowPets: !!Number(allowPets)
    };
    await insertRentalPost(insertRentalPostPayload);

    if (req.files?.length) {
      const uploadImageResult = await uploadPostImageHandler(req);
      if (uploadImageResult.success.length) {
        await insertPostAssetsHandler(uploadImageResult.success, { userId: users.id!, postId });
      } else {
        throw new ApiResponse(StatusCodes.BAD_REQUEST, 'Failed to upload!', uploadImageResult).send(res);
      }
    }

    return new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, { postId }).send(res);
  } catch (error) {
    next(error);
  }
};

export const createWantedPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let {
      title,
      description,
      addressProvince,
      addressDistrict,
      addressWard,
      addressDetail,
      expirationAfter,
      expirationAfterUnit,
      addressLongitude,
      addressLatitude,
      note,
      priceStart,
      priceEnd,
      priceUnit,
      moveInDate,
      hasFurniture,
      hasAirConditioner,
      hasWashingMachine,
      hasRefrigerator,
      hasPrivateBathroom,
      hasParking,
      hasSecurity,
      hasElevator,
      allowPets
    } = req.body;
    const currentUser = req.currentUser!;
    const { users, users_detail } = currentUser;

    if (!addressLatitude || !addressLongitude) {
      const address = `${addressWard} ${addressDistrict} ${addressProvince}`;
      const getGeoCodingResult = await geocodingByGeocodeMap(address);
      addressLatitude = getGeoCodingResult.latitude;
      addressLongitude = getGeoCodingResult.longitude;
    }

    const insertPostPayload: postSchemaType = {
      ownerId: users.id,
      type: 'wanted',
      title,
      note,
      description,
      addressProvince,
      addressDistrict,
      addressWard,
      addressDetail,
      addressLongitude,
      addressLatitude,
      expirationAfter,
      expirationAfterUnit
    };
    const insertPostResult = await insertPost(insertPostPayload);
    const { id: postId } = insertPostResult[0];

    if (isNaN(Date.parse(moveInDate))) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'moveInDate value is invalid');
    }

    const insertWantedPostPayload: wantedPostSchemaType = {
      postId,
      priceStart,
      priceEnd,
      priceUnit,
      moveInDate: new Date(moveInDate),
      hasFurniture: !!Number(hasFurniture),
      hasAirConditioner: !!Number(hasAirConditioner),
      hasWashingMachine: !!Number(hasWashingMachine),
      hasRefrigerator: !!Number(hasRefrigerator),
      hasPrivateBathroom: !!Number(hasPrivateBathroom),
      hasParking: !!Number(hasParking),
      hasSecurity: !!Number(hasSecurity),
      hasElevator: !!Number(hasElevator),
      allowPets: !!Number(allowPets)
    };
    await insertWantedPost(insertWantedPostPayload);

    if (req.files?.length) {
      const uploadImageResult = await uploadPostImageHandler(req);
      if (uploadImageResult.success.length) {
        await insertPostAssetsHandler(uploadImageResult.success, { userId: users.id!, postId });
      } else {
        throw new ApiResponse(StatusCodes.BAD_REQUEST, 'Failed to upload!', uploadImageResult).send(res);
      }
    }

    return new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, { postId }).send(res);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const getPostResult = await selectPostById(Number(postId));
    if (!getPostResult.length) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }

    const selectResult = await selectFullPostDetailById(Number(postId), getPostResult[0].type);

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, selectResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const searchRentalPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const { whereConditions, orderConditions, pagination } = req.body;
    if (!whereConditions || !orderConditions) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'whereConditions or orderConditions is required, but it can be empty'
      );
    }
    const {
      title,
      priceStart,
      priceEnd,
      provinceName,
      districtName,
      wardName,
      nearest,
      hasFurniture,
      hasAirConditioner,
      hasWashingMachine,
      hasRefrigerator,
      hasPrivateBathroom,
      hasParking,
      hasSecurity,
      hasElevator,
      allowPets
    } = whereConditions;
    const { createdAt, price } = orderConditions;
    if (!type || Object.values(postType).includes(type as postType)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    if (nearest && (!nearest?.longitude || !nearest?.latitude)) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Longitude and latitude are required when [nearest] param is provided'
      );
    }

    const where: ConditionsType<selectRentalPostByConditionType> = {
      ...(title && {
        title: {
          operator: 'like',
          value: `%${title}%`
        }
      }),
      ...(provinceName && {
        addressProvince: {
          operator: 'like',
          value: `%${provinceName}%`
        }
      }),
      ...(districtName && {
        addressDistrict: {
          operator: 'like',
          value: `%${districtName}%`
        }
      }),
      ...(wardName && {
        addressWard: {
          operator: 'like',
          value: `%${wardName}%`
        }
      }),
      ...(nearest &&
        nearest?.longitude && {
          addressLongitude: {
            operator: 'eq',
            value: nearest?.longitude
          }
        }),
      ...(nearest &&
        nearest?.latitude && {
          addressLatitude: {
            operator: 'eq',
            value: nearest?.latitude
          }
        }),
      ...(nearest && {
        radius: nearest?.radius ? nearest?.radius : 50
      }),
      ...(priceStart && {
        priceStart: {
          operator: 'between',
          value: [priceStart, priceEnd || priceStart]
        }
      }),
      ...(hasFurniture && {
        hasFurniture: {
          operator: 'eq',
          value: true
        }
      }),
      ...(hasAirConditioner && {
        hasAirConditioner: {
          operator: 'eq',
          value: true
        }
      }),
      ...(hasWashingMachine && {
        hasWashingMachine: {
          operator: 'eq',
          value: true
        }
      }),
      ...(hasRefrigerator && {
        hasRefrigerator: {
          operator: 'eq',
          value: true
        }
      }),
      ...(hasPrivateBathroom && {
        hasPrivateBathroom: {
          operator: 'eq',
          value: true
        }
      }),
      ...(hasParking && {
        hasParking: {
          operator: 'eq',
          value: true
        }
      }),
      ...(hasSecurity && {
        hasSecurity: {
          operator: 'eq',
          value: true
        }
      }),
      ...(hasElevator && {
        hasElevator: {
          operator: 'eq',
          value: true
        }
      }),
      ...(allowPets && {
        allowPets: {
          operator: 'eq',
          value: true
        }
      })
    };
    const options: selectOptions<selectRentalPostByConditionType> = {
      orderConditions: {
        ...(createdAt && { createdAt }),
        ...(price && { priceStart: price })
      },
      ...(pagination && {
        pagination: {
          page: pagination?.page,
          pageSize: pagination?.pageSize
        }
      })
    };

    const totalResults = await selectRentalPostByConditions(where, {
      ...options,
      pagination: { page: 1, pageSize: 99999999 }
    });

    const results = await selectRentalPostByConditions(where, options);

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, {
      results,
      pagination: paginationHelper({
        total: totalResults.length,
        page: pagination?.page,
        pageSize: pagination?.pageSize
      })
    }).send(res);
  } catch (error) {
    next(error);
  }
};
