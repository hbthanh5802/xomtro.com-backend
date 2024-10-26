import { createUser, createUserDetail, getFullUserByConditions, getUserDetailByEmail } from '@/services/user.service';
import { userDetailSchemaType, userSchemaType } from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { timeInVietNam } from '@/utils/time.helper';
import {
  emailVerifyTokenType,
  generateAccessToken,
  generateRefreshToken,
  generateVerifyEmailToken,
  refreshExpirationTime,
  tokenPayloadType,
  verifyJwtToken
} from '@/utils/token.helper';
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { insertToken, removeTokenByCondition } from './../services/token.service';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password, role, firstName, lastName } = req.body;
    const existingUser = await getUserDetailByEmail(email);
    if (existingUser.length) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email is already used!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    //
    const userPayload: userSchemaType = { password: hashedPassword };
    const userResult = await createUser(userPayload);
    //
    const userDetailPayload: userDetailSchemaType = {
      role,
      firstName,
      lastName,
      userId: userResult[0].id,
      email,
      phone
    };
    const userDetailResult = await createUserDetail(userDetailPayload);
    return new ApiResponse(StatusCodes.CREATED, 'Register successfully!', userDetailResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password } = req.body;

    const fullUserResult = await getFullUserByConditions({ email });
    if (!fullUserResult.length) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }

    const { users, users_detail } = fullUserResult[0];

    const isMatchingPassword = await bcrypt.compare(password, users.password);

    if (!isMatchingPassword) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    const tokenPayload: tokenPayloadType = {
      userId: users.id,
      email: users_detail.email,
      tokenVersion: users.tokenVersion
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await removeTokenByCondition({ userId: users.id, type: 'refresh', target: 'refresh' });
    await insertToken({
      value: refreshToken,
      userId: users.id,
      expirationTime: timeInVietNam().add(refreshExpirationTime, 'second').toDate(),
      type: 'refresh',
      target: 'refresh'
    });

    res.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict'
    });

    const responseData = {
      userDetail: users_detail,
      meta: { accessToken, refreshToken }
    };

    return new ApiResponse(StatusCodes.OK, 'Login successfully!', responseData).send(res);
  } catch (error) {
    next(error);
  }
};
