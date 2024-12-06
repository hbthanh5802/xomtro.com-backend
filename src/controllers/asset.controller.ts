import { selectAssetsByConditions } from '@/services/asset.service';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getAssetByIds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assetIds } = req.query;
    if (!assetIds) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'assetIds must be an assetId array!');
    }
    let ids;
    if (Array.isArray(assetIds)) {
      ids = assetIds.map((id) => Number(id)).filter((id) => Number.isSafeInteger(id));
    } else {
      ids = [Number(assetIds)];
    }
    const response = await selectAssetsByConditions({
      id: {
        operator: 'in',
        value: ids
      }
    });

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, response).send(res);
  } catch (error) {
    next(error);
  }
};
