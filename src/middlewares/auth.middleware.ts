import { selectFullUserByConditions } from '@/services/user.service';
import { userStatus } from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { verifyJwtToken } from '@/utils/token.helper';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userToken = req.headers.authorization?.split(' ')[1];
    if (!userToken) {
      return new ApiResponse(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED).send(res);
    }

    const tokenPayload = await verifyJwtToken(userToken, 'access');
    const { userId, tokenVersion } = tokenPayload;

    const userResult = await selectFullUserByConditions({ userId });
    const existingUser = userResult[0];

    if (!existingUser) {
      return new ApiResponse(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN).send(res);
    }

    if (existingUser.users.tokenVersion !== tokenVersion) {
      return new ApiResponse(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED).send(res);
    }

    if (existingUser.users.status !== userStatus.ACTIVED) {
      return new ApiResponse(StatusCodes.FORBIDDEN, 'User is not actived', {
        userStatus: existingUser.users.status
      }).send(res);
    }

    req.currentUser = existingUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyRenter = async (req: Request, res: Response, next: NextFunction) => {
  await verifyUser(req, res, () => {
    if (!req.currentUser) {
      return new ApiResponse(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN).send(res);
    }

    if (req.currentUser.users.id === Number(req.params.userId) || req.currentUser?.users_detail.role === 'renter') {
      next();
    } else {
      return new ApiResponse(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN).send(res);
    }
  });
};

export const verifyLandlord = async (req: Request, res: Response, next: NextFunction) => {
  await verifyUser(req, res, () => {
    if (!req.currentUser) {
      return new ApiResponse(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN).send(res);
    }

    if (req.currentUser.users.id === Number(req.params.userId) || req.currentUser?.users_detail.role === 'landlord') {
      next();
    } else {
      return new ApiResponse(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN).send(res);
    }
  });
};
