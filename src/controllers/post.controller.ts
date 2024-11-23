import { insertAsset } from '@/services/asset.service';
import { deleteManyResources, uploadImage } from '@/services/fileUpload.service';
import { geocodingByDistanceMatrix, geocodingByGeocodeMap, geocodingByGoong } from '@/services/location.service';
import {
  deleteManyPassPostItems,
  deletePostAssets,
  deletePostById,
  insertJoinPost,
  insertPassPost,
  insertPassPostItem,
  insertPost,
  insertPostAssets,
  insertRentalPost,
  insertWantedPost,
  selectFullPostDetailById,
  selectJoinPostByConditionType,
  selectJoinPostByConditions,
  selectPassPostByConditionType,
  selectPassPostByConditions,
  selectPassPostItemsByPostId,
  selectPostAssetsByPostId,
  selectPostById,
  selectRentalPostByConditionType,
  selectRentalPostByConditions,
  selectWantedPostByConditionType,
  selectWantedPostByConditions,
  updateJoinPostByPostId,
  updatePassPostByPostId,
  updatePassPostItemById,
  updatePostById,
  updateRentalPostByPostId,
  updateWantedPostByPostId
} from '@/services/post.service';
import { ConditionsType } from '@/types/drizzle.type';
import {
  assetSchemaType,
  assetType,
  joinPostSchemaType,
  passItemStatusType,
  passPostItemSchemaType,
  passPostSchemaType,
  postAssetsSchemaType,
  postSchemaType,
  postStatus,
  postType,
  rentalPostSchemaType,
  wantedPostSchemaType
} from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { cleanObject, generateSlug } from '@/utils/constants.helper';
import { checkUserAndPostPermission, paginationHelper, selectOptions } from '@/utils/schema.helper';
import { timeInVietNam } from '@/utils/time.helper';
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
        folder: 'posts',
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
      addressCode,
      addressProvince,
      addressDistrict,
      addressWard,
      addressDetail,
      expirationAfter,
      expirationAfterUnit,
      addressLongitude,
      addressLatitude,
      note,
      totalArea,
      totalAreaUnit,
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
      hasInternet,
      allowPets
    } = cleanObject(req.body);
    const currentUser = req.currentUser!;
    const { users, users_detail } = currentUser;

    if (!addressLongitude || !addressLatitude) {
      const address = `${addressWard}, ${addressDistrict}, ${addressProvince}`;
      const apiServices = [
        () => geocodingByDistanceMatrix(address as string),
        () => geocodingByGoong(address as string)
      ];

      const randomApiServiceIndex = Math.floor(Math.random() * apiServices.length);
      await apiServices[randomApiServiceIndex]()
        .then((getGeoCodingResult) => {
          addressLatitude = getGeoCodingResult.latitude;
          addressLongitude = getGeoCodingResult.longitude;
        })
        .catch(() => {});
    }

    const insertPostPayload: postSchemaType = {
      ownerId: users.id,
      type: 'rental',
      title,
      titleSlug: generateSlug(title),
      note,
      description,
      addressCode,
      addressProvince,
      addressDistrict,
      addressWard,
      addressDetail,
      addressSlug: generateSlug(`${addressWard} ${addressDistrict} ${addressProvince}`),
      addressLongitude,
      addressLatitude,
      expirationAfter,
      expirationAfterUnit
    };
    const insertPostResult = await insertPost(cleanObject(insertPostPayload) as postSchemaType);
    const { id: postId } = insertPostResult[0];

    const insertRentalPostPayload: rentalPostSchemaType = {
      postId,
      priceStart,
      priceEnd,
      priceUnit,
      minLeaseTerm,
      minLeaseTermUnit,
      totalArea: Number(totalArea),
      totalAreaUnit,
      hasFurniture,
      hasAirConditioner,
      hasWashingMachine,
      hasRefrigerator,
      hasPrivateBathroom,
      hasParking,
      hasSecurity,
      hasElevator,
      hasInternet,
      allowPets
    };
    await insertRentalPost(cleanObject(insertRentalPostPayload) as rentalPostSchemaType);

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
    const { users } = currentUser;

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
    const insertPostResult = await insertPost(cleanObject(insertPostPayload) as postSchemaType);
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
    await insertWantedPost(cleanObject(insertWantedPostPayload) as wantedPostSchemaType);

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

export const createJoinPost = async (req: Request, res: Response, next: NextFunction) => {
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
      totalArea,
      totalAreaUnit,
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
    const { users } = currentUser;

    if (!addressLatitude || !addressLongitude) {
      const address = `${addressWard} ${addressDistrict} ${addressProvince}`;
      const getGeoCodingResult = await geocodingByGeocodeMap(address);
      addressLatitude = getGeoCodingResult.latitude;
      addressLongitude = getGeoCodingResult.longitude;
    }

    const insertPostPayload: postSchemaType = {
      ownerId: users.id,
      type: 'join',
      title,
      titleSlug: generateSlug(title),
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

    if (isNaN(Date.parse(moveInDate))) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'moveInDate value is invalid');
    }

    const insertPostResult = await insertPost(insertPostPayload);
    const { id: postId } = insertPostResult[0];

    const insertWantedPostPayload: joinPostSchemaType = {
      postId,
      priceStart,
      priceEnd,
      priceUnit,
      totalArea: Number(totalArea),
      totalAreaUnit,
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

    await insertJoinPost(cleanObject(insertWantedPostPayload) as joinPostSchemaType);

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

export const createPassPost = async (req: Request, res: Response, next: NextFunction) => {
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
      priceUnit,
      passItems
    } = req.body;
    const currentUser = req.currentUser!;
    const { users } = currentUser;

    if (!addressLatitude || !addressLongitude) {
      const address = `${addressWard} ${addressDistrict} ${addressProvince}`;
      const getGeoCodingResult = await geocodingByGeocodeMap(address);
      addressLatitude = getGeoCodingResult.latitude;
      addressLongitude = getGeoCodingResult.longitude;
    }

    if (!passItems || !Array.isArray(passItems) || !passItems.length) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'passItems can not be empty');
    }

    const passItemsPrice = passItems.map((item) => item.passItemPrice as number);

    const insertPostPayload: postSchemaType = {
      ownerId: users.id,
      type: 'pass',
      title,
      titleSlug: generateSlug(title),
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

    //

    const insertPassPostPayload: passPostSchemaType = {
      postId,
      priceStart: Math.min(...passItemsPrice),
      priceEnd: Math.max(...passItemsPrice),
      priceUnit
    };
    await insertPassPost(insertPassPostPayload);

    const insertPassPostItemsPayload: passPostItemSchemaType[] = passItems.map((item) => {
      const { passItemName, passItemPrice, passItemStatus } = item;
      return {
        passPostId: postId,
        passItemStatus,
        passItemPrice,
        passItemName,
        passItemNameSlug: generateSlug(passItemName)
      };
    });
    await insertPassPostItem(insertPassPostItemsPayload);

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
    if (!selectResult.length || !selectResult[0].detail) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, selectResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const searchPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.params.type;
    const { whereConditions, orderConditions, pagination } = req.body;
    if (!whereConditions || !orderConditions) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'whereConditions or orderConditions is required, but it can be empty'
      );
    }
    const {
      title,
      status,
      priceStart,
      priceEnd,
      provinceName,
      districtName,
      wardName,
      nearest,
      dateStart,
      dateEnd,
      totalAreaStart,
      totalAreaEnd,
      totalAreaUnit,
      hasFurniture,
      hasAirConditioner,
      hasWashingMachine,
      hasRefrigerator,
      hasPrivateBathroom,
      hasParking,
      hasSecurity,
      hasElevator,
      hasInternet,
      ownerId,
      allowPets
    } = whereConditions;
    const { createdAt, price } = orderConditions;

    if (!type || !Object.values(postType).includes(type as postType)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid post type parameter');
    }

    if (status && !Object.values(status).includes(type as postStatus)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid post status parameter');
    }

    if (nearest && (!nearest?.longitude || !nearest?.latitude)) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Longitude and latitude are required when [nearest] param is provided'
      );
    }

    if (dateStart && isNaN(Date.parse(dateStart))) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'dateStart value is invalid');
    }

    const where: ConditionsType<
      selectWantedPostByConditionType | selectWantedPostByConditionType | selectJoinPostByConditionType
    > = {
      type: {
        operator: 'eq',
        value: type
      },
      ...(status && {
        status: {
          operator: 'eq',
          value: status
        }
      }),
      ...(ownerId && {
        ownerId: {
          operator: 'eq',
          value: Number(ownerId)
        }
      }),
      ...(title && {
        titleSlug: {
          operator: 'like',
          value: `%${generateSlug(title)}%`
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
      ...(hasInternet && {
        hasInternet: {
          operator: 'eq',
          value: true
        }
      }),
      ...(allowPets && {
        allowPets: {
          operator: 'eq',
          value: true
        }
      }),
      ...(totalAreaStart && {
        totalArea: {
          operator: 'between',
          value: [totalAreaStart, totalAreaEnd || totalAreaStart]
        }
      }),
      ...(totalAreaUnit && {
        totalAreaUnit: {
          operator: 'eq',
          value: totalAreaUnit
        }
      }),
      ...(dateStart && {
        createdAt: {
          operator: 'between',
          value: [new Date(dateStart), dateEnd ? new Date(dateEnd) : timeInVietNam().toDate()]
        }
      })
    };
    const options: selectOptions<
      selectWantedPostByConditionType | selectWantedPostByConditionType | selectJoinPostByConditionType
    > = {
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

    let totalPromise;
    let searchPromise;
    switch (type) {
      case postType.RENTAL:
        searchPromise = selectRentalPostByConditions(where as ConditionsType<selectRentalPostByConditionType>, options);
        totalPromise = selectRentalPostByConditions(where as ConditionsType<selectRentalPostByConditionType>, {
          ...options,
          pagination: { page: 1, pageSize: 99999999 }
        });
        break;
      case postType.WANTED:
        searchPromise = selectWantedPostByConditions(where as ConditionsType<selectWantedPostByConditionType>, options);
        totalPromise = selectWantedPostByConditions(where as ConditionsType<selectWantedPostByConditionType>, {
          ...options,
          pagination: { page: 1, pageSize: 99999999 }
        });
        break;
      case postType.JOIN:
        searchPromise = selectJoinPostByConditions(where as ConditionsType<selectJoinPostByConditionType>, options);
        totalPromise = selectJoinPostByConditions(where as ConditionsType<selectJoinPostByConditionType>, {
          ...options,
          pagination: { page: 1, pageSize: 99999999 }
        });
        break;
      default:
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid post type parameter');
    }

    const totalResults = await totalPromise;
    const results = await searchPromise;

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

export const searchPassPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { whereConditions, orderConditions, pagination } = req.body;
    if (!whereConditions || !orderConditions) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'whereConditions or orderConditions is required, but it can be empty'
      );
    }
    const {
      title,
      status,
      passItemName,
      passItemStatus,
      priceStart,
      priceEnd,
      provinceName,
      districtName,
      wardName,
      nearest,
      dateStart,
      dateEnd
    } = whereConditions;
    const { createdAt, price } = orderConditions;

    if (status && !Object.values(status).includes(status as postStatus)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid post status parameter');
    }

    if (passItemStatus && !Object.values(passItemStatusType).includes(passItemStatus as passItemStatusType)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid passItemStatus parameter');
    }

    if (nearest && (!nearest?.longitude || !nearest?.latitude)) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Longitude and latitude are required when [nearest] param is provided'
      );
    }

    if (dateStart && isNaN(Date.parse(dateStart))) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'dateStart value is invalid');
    }

    const where: ConditionsType<selectPassPostByConditionType> = {
      type: {
        operator: 'eq',
        value: 'pass'
      },
      ...(status && {
        status: {
          operator: 'eq',
          value: status
        }
      }),
      ...(title && {
        titleSlug: {
          operator: 'like',
          value: `%${generateSlug(title)}%`
        }
      }),
      ...(passItemName && {
        passItemNameSlug: {
          operator: 'like',
          value: `%${generateSlug(passItemName)}%`
        }
      }),
      ...(passItemStatus && {
        passItemStatus: {
          operator: 'eq',
          value: passItemStatus
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
      ...(dateStart && {
        createdAt: {
          operator: 'between',
          value: [new Date(dateStart), dateEnd ? new Date(dateEnd) : timeInVietNam().toDate()]
        }
      })
    };
    const options: selectOptions<selectPassPostByConditionType> = {
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

    const totalResults = await selectPassPostByConditions(where, {
      ...options,
      pagination: { page: 1, pageSize: 99999999 }
    });
    const results = await selectPassPostByConditions(where, options);

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

export const hiddenPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;
    const postId = req.params.postId;

    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    const willUpdateStatus = post.status === 'actived' ? postStatus.UNACTIVED : postStatus.ACTIVED;
    await updatePostById(post.id, { status: willUpdateStatus });

    return new ApiResponse(StatusCodes.OK, 'Change post status successfully!', { status: willUpdateStatus }).send(res);
  } catch (error) {
    next(error);
  }
};

export const removePostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;
    const postId = req.params.postId;

    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    const postAssetsResult = (await selectPostAssetsByPostId(post.id)).map((postAsset) => postAsset.name);

    await Promise.allSettled([
      deleteManyResources(postAssetsResult as string[], 'image'),
      deletePostById(Number(postId))
    ]);

    return new ApiResponse(StatusCodes.OK, 'Delete post successfully!', { removedPostId: post.id }).send(res);
  } catch (error) {
    next(error);
  }
};

export const removePostAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;
    const postId = req.params.postId;
    const assetIds = req.query.assetIds;

    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    const postAssetsResult = await selectPostAssetsByPostId(post.id);
    if (!postAssetsResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }
    const postAssetIds = postAssetsResult.map((postAsset) => postAsset.id!);

    let removeAssetIds: number[];
    if (Array.isArray(assetIds)) {
      removeAssetIds = assetIds.map((id) => Number(id)).filter((id) => typeof id === 'number' && !isNaN(id));
    } else {
      removeAssetIds = [Number(assetIds)];
    }

    const willRemoveIds = postAssetIds.filter((id) => removeAssetIds.includes(id));
    const willRemoveAssetNames = postAssetsResult
      .filter((postAsset) => willRemoveIds.includes(postAsset.id!))
      .map((postAsset) => postAsset.name);

    await Promise.allSettled([
      deleteManyResources(willRemoveAssetNames as string[], 'image'),
      deletePostAssets(post.id, willRemoveIds)
    ]);

    return new ApiResponse(StatusCodes.OK, 'Delete post assets successfully', {
      removedIds: willRemoveIds,
      removedAssetNames: willRemoveAssetNames
    }).send(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateRentalPost = async (req: Request, res: Response, next: NextFunction) => {
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
      totalArea,
      totalAreaUnit,
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
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;
    const postId = req.params.postId;

    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!addressLatitude || !addressLongitude) {
      const address = `${addressWard} ${addressDistrict} ${addressProvince}`;
      const getGeoCodingResult = await geocodingByGeocodeMap(address);
      addressLatitude = getGeoCodingResult.latitude;
      addressLongitude = getGeoCodingResult.longitude;
    }

    const updatePostPayload: Partial<postSchemaType> = {
      title,
      titleSlug: generateSlug(title),
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
    const updatePostDetailPayload: Partial<rentalPostSchemaType> = {
      priceStart,
      priceEnd,
      priceUnit,
      minLeaseTerm,
      minLeaseTermUnit,
      totalArea: Number(totalArea),
      totalAreaUnit,
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
    await Promise.all([
      updatePostById(post.id, cleanObject(updatePostPayload)),
      updateRentalPostByPostId(post.id, cleanObject(updatePostDetailPayload))
    ]);

    if (req.files?.length) {
      const uploadImageResult = await uploadPostImageHandler(req);
      if (uploadImageResult.success.length) {
        await insertPostAssetsHandler(uploadImageResult.success, {
          userId: users_detail.userId!,
          postId: post.id
        });
      } else {
        throw new ApiResponse(StatusCodes.BAD_REQUEST, 'Failed to upload!', uploadImageResult).send(res);
      }
    }

    const updatedPostResult = await selectFullPostDetailById(post.id, post.type);

    return new ApiResponse(StatusCodes.OK, 'Updated post successfully!', updatedPostResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const updateWantedPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let {
      title,
      description,
      addressProvince,
      addressDistrict,
      addressWard,
      addressDetail,
      moveInDate,
      expirationAfter,
      expirationAfterUnit,
      addressLongitude,
      addressLatitude,
      note,
      totalArea,
      totalAreaUnit,
      priceStart,
      priceEnd,
      priceUnit,
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
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;
    const postId = req.params.postId;

    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    if (isNaN(Date.parse(moveInDate))) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'moveInDate value is invalid');
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!addressLatitude || !addressLongitude) {
      const address = `${addressWard} ${addressDistrict} ${addressProvince}`;
      const getGeoCodingResult = await geocodingByGeocodeMap(address);
      addressLatitude = getGeoCodingResult.latitude;
      addressLongitude = getGeoCodingResult.longitude;
    }

    const updatePostPayload: Partial<postSchemaType> = {
      title,
      titleSlug: generateSlug(title),
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
    const updatePostDetailPayload: Partial<wantedPostSchemaType> = {
      priceStart,
      priceEnd,
      priceUnit,
      moveInDate: new Date(moveInDate),
      totalArea: Number(totalArea),
      totalAreaUnit,
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
    await Promise.all([
      updatePostById(post.id, cleanObject(updatePostPayload)),
      updateWantedPostByPostId(post.id, cleanObject(updatePostDetailPayload))
    ]);

    if (req.files?.length) {
      const uploadImageResult = await uploadPostImageHandler(req);
      if (uploadImageResult.success.length) {
        await insertPostAssetsHandler(uploadImageResult.success, {
          userId: users_detail.userId!,
          postId: post.id
        });
      } else {
        throw new ApiResponse(StatusCodes.BAD_REQUEST, 'Failed to upload!', uploadImageResult).send(res);
      }
    }

    const updatedPostResult = await selectFullPostDetailById(post.id, post.type);

    return new ApiResponse(StatusCodes.OK, 'Updated post successfully!', updatedPostResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const updateJoinPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let {
      title,
      description,
      addressProvince,
      addressDistrict,
      addressWard,
      addressDetail,
      moveInDate,
      expirationAfter,
      expirationAfterUnit,
      addressLongitude,
      addressLatitude,
      note,
      totalArea,
      totalAreaUnit,
      priceStart,
      priceEnd,
      priceUnit,
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
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;
    const postId = req.params.postId;

    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    if (isNaN(Date.parse(moveInDate))) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'moveInDate value is invalid');
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!addressLatitude || !addressLongitude) {
      const address = `${addressWard} ${addressDistrict} ${addressProvince}`;
      const getGeoCodingResult = await geocodingByGeocodeMap(address);
      addressLatitude = getGeoCodingResult.latitude;
      addressLongitude = getGeoCodingResult.longitude;
    }

    const updatePostPayload: Partial<postSchemaType> = {
      title,
      titleSlug: generateSlug(title),
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
    const updatePostDetailPayload: Partial<joinPostSchemaType> = {
      priceStart,
      priceEnd,
      priceUnit,
      moveInDate: new Date(moveInDate),
      totalArea: Number(totalArea),
      totalAreaUnit,
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
    await Promise.all([
      updatePostById(post.id, cleanObject(updatePostPayload)),
      updateJoinPostByPostId(post.id, cleanObject(updatePostDetailPayload))
    ]);

    if (req.files?.length) {
      const uploadImageResult = await uploadPostImageHandler(req);
      if (uploadImageResult.success.length) {
        await insertPostAssetsHandler(uploadImageResult.success, {
          userId: users_detail.userId!,
          postId: post.id
        });
      } else {
        throw new ApiResponse(StatusCodes.BAD_REQUEST, 'Failed to upload!', uploadImageResult).send(res);
      }
    }

    const updatedPostResult = await selectFullPostDetailById(post.id, post.type);

    return new ApiResponse(StatusCodes.OK, 'Updated post successfully!', updatedPostResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const updatePassPost = async (req: Request, res: Response, next: NextFunction) => {
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
      priceUnit,
      passItems
    } = req.body;
    const currentUser = req.currentUser;
    const { users_detail, users } = currentUser!;
    const postId = req.params.postId;

    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!addressLatitude || !addressLongitude) {
      const address = `${addressWard} ${addressDistrict} ${addressProvince}`;
      const getGeoCodingResult = await geocodingByGeocodeMap(address);
      addressLatitude = getGeoCodingResult.latitude;
      addressLongitude = getGeoCodingResult.longitude;
    }

    if (!passItems || !Array.isArray(passItems) || !passItems.length) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'passItems can not be empty');
    }

    const passPostItemsResult = (await selectPassPostItemsByPostId(post.id)).map((passItem) => passItem.passItemPrice);
    const passItemsPrices = passItems.map((item) => item.passItemPrice as number);

    const updatePostPayload: Partial<postSchemaType> = {
      title,
      titleSlug: generateSlug(title),
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
    const updatePassPostPayload: Partial<passPostSchemaType> = {
      priceStart: Math.min(...passItemsPrices, ...passPostItemsResult),
      priceEnd: Math.max(...passItemsPrices, ...passPostItemsResult),
      priceUnit
    };
    const insertPassPostItemsPayload: passPostItemSchemaType[] = passItems.map((item) => {
      const { passItemName, passItemPrice, passItemStatus } = item;
      return {
        passPostId: post.id,
        passItemStatus,
        passItemPrice,
        passItemName,
        passItemNameSlug: generateSlug(passItemName)
      };
    });
    await Promise.all([
      updatePostById(post.id, cleanObject(updatePostPayload)),
      updatePassPostByPostId(post.id, updatePassPostPayload),
      insertPassPostItem(insertPassPostItemsPayload)
    ]);

    if (req.files?.length) {
      const uploadImageResult = await uploadPostImageHandler(req);
      if (uploadImageResult.success.length) {
        await insertPostAssetsHandler(uploadImageResult.success, { userId: users.id!, postId: post.id });
      } else {
        throw new ApiResponse(StatusCodes.BAD_REQUEST, 'Failed to upload!', uploadImageResult).send(res);
      }
    }

    return new ApiResponse(StatusCodes.OK, 'Update pass post successfully!', { postId }).send(res);
  } catch (error) {
    next(error);
  }
};

export const updatePassPostItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { passItemName, passItemPrice, passItemStatus } = req.body;
    const currentUser = req.currentUser;
    const { users_detail, users } = currentUser!;
    const { postId, itemId } = req.params;

    if (!postId || !itemId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    const passItemsResult = await selectPassPostItemsByPostId(post.id);
    const passItemIds = passItemsResult.map((item) => item.id);
    if (!passItemIds.includes(Number(itemId))) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const passItemPrices = passItemsResult.map((item) => item.passItemPrice);
    const updatePassPostPayload: Partial<passPostSchemaType> = {
      priceStart: Math.min(...passItemPrices, passItemPrice),
      priceEnd: Math.max(...passItemPrices, passItemPrice)
    };
    const updatePassItemPayload: Partial<passPostItemSchemaType> = {
      passItemStatus,
      passItemName,
      ...(passItemName && { passItemNameSlug: generateSlug(passItemName) }),
      passItemPrice
    };
    await Promise.all([
      updatePassPostItemById(Number(itemId), cleanObject(updatePassItemPayload)),
      updatePassPostByPostId(post.id, cleanObject(updatePassPostPayload))
    ]);

    return new ApiResponse(StatusCodes.OK, 'Update pass item successfully!', { updatedId: Number(itemId) }).send(res);
  } catch (error) {
    next(error);
  }
};

export const removePassPostItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;
    const postId = req.params.postId;
    const passItemIds = req.query.passItemIds;

    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingPostResult = await selectPostById(Number(postId));
    if (!existingPostResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const post = existingPostResult[0];
    if (post.ownerId !== users_detail.userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    if (!checkUserAndPostPermission(users_detail.role as string, post.type)) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    const passPostItemIdsResult = (await selectPassPostItemsByPostId(post.id)).map((passItem) => passItem.id);
    if (!passPostItemIdsResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    let removeAssetIds: number[];
    if (Array.isArray(passItemIds)) {
      removeAssetIds = passItemIds.map((id) => Number(id)).filter((id) => typeof id === 'number' && !isNaN(id));
    } else {
      removeAssetIds = [Number(passItemIds)];
    }
    removeAssetIds = removeAssetIds.filter((id) => passPostItemIdsResult.includes(id));
    await deleteManyPassPostItems(post.id, removeAssetIds);

    return new ApiResponse(StatusCodes.OK, 'Delete post assets successfully', { removeIds: removeAssetIds }).send(res);
  } catch (error) {
    next(error);
  }
};

export const updateViewCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params;
    if (!postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const postResult = await selectPostById(Number(postId));
    if (!postResult.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }
    const post = postResult[0];
    await updatePostById(post.id, { viewedCount: post.viewedCount! + 1 });

    return new ApiResponse(StatusCodes.OK, 'Update view post successfully!').send(res);
  } catch (error) {
    next(error);
  }
};
