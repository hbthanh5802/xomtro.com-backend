import * as analyticService from '@/services/analytic.service';
import { ConditionsType } from '@/types/drizzle.type';
import { PostSelectSchemaType, postStatus } from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { timeInVietNam } from '@/utils/time.helper';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getPostsCountByTypeWithPostConditions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ownerId, provinceName, districtName, wardName, dateStart, dateEnd, status } = req.body;

    if (status && !Object.values(postStatus).includes(status as postStatus)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid post status parameter');
    }

    if (dateStart && isNaN(Date.parse(dateStart))) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'dateStart value is invalid');
    }

    const where: ConditionsType<PostSelectSchemaType> = {
      ...(ownerId && {
        ownerId: {
          operator: 'eq',
          value: Number(ownerId)
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
      ...(dateStart && {
        updatedAt: {
          operator: 'between',
          value: [new Date(dateStart), dateEnd ? new Date(dateEnd) : timeInVietNam().toDate()]
        }
      })
    };

    const response = await analyticService.selectPostsCountByTypeWithPostConditions(where);

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, response).send(res);
  } catch (error) {
    next(error);
  }
};
