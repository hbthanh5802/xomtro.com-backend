import { insertAsset } from '@/services/asset.service';
import { uploadImage } from '@/services/fileUpload.service';
import { geocodingByDistanceMatrix, geocodingByGeocodeMap } from '@/services/location.service';
import { insertPost, insertPostAssets, insertRentalPost } from '@/services/post.service';
import {
  assetSchemaType,
  assetType,
  postAssetsSchemaType,
  postSchemaType,
  rentalPostSchemaType
} from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { generateFileName } from '@/utils/file.helper';
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
      tagsList,
      priceStart,
      priceEnd,
      priceUnit,
      minLeaseTerm,
      minLeaseTermUnit
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
      expirationAfterUnit,
      tagsList
    };
    const insertPostResult = await insertPost(insertPostPayload);
    const { id: postId } = insertPostResult[0];

    const insertRentalPostPayload: rentalPostSchemaType = {
      postId,
      priceStart,
      priceEnd,
      priceUnit,
      minLeaseTerm,
      minLeaseTermUnit
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
