import { searchTokenByCondition } from '@/services/token.service';
import {
  createUser,
  createUserDetail,
  getFullUserByConditions,
  getUserDetailByEmail,
  updateUserById,
  updateUserDetailById
} from '@/services/user.service';
import { tokenSchemaType, userDetailSchemaType, userSchemaType } from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { generateVerifyEmailContent, sendEmail } from '@/utils/email.helper';
import { formatTimeForVietnamese, timeInVietNam } from '@/utils/time.helper';
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

export const getVerifyUserEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string;
    if (!email) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);

    const userDetailResult = await getUserDetailByEmail(email);
    const existingUser = userDetailResult[0];

    if (!existingUser) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'User is not exist!').send(res);
    }

    if (existingUser.isEmailVerified) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'User email had already been actived.').send(res);
    }

    if (existingUser.email === email) {
      await removeTokenByCondition({ userId: existingUser.userId, type: 'verify' });
      const verifyToken = generateVerifyEmailToken(existingUser.userId, existingUser.email);

      const expirationTime = timeInVietNam().add(5, 'minute').toDate();
      const tokenPayload: tokenSchemaType = {
        userId: existingUser.userId,
        value: verifyToken,
        type: 'verify',
        expirationTime: expirationTime
      };

      const emailContent = generateVerifyEmailContent(verifyToken, formatTimeForVietnamese(expirationTime), {
        headerText: 'Verify Your Email'
      });
      await sendEmail(existingUser.email, 'Verify Your Account', emailContent);
      await insertToken(tokenPayload);

      return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK).send(res);
    }
  } catch (error) {
    next(error);
  }
};

export const verifyUserEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);

    const tokenPayload = (await verifyJwtToken(token, 'secret')) as emailVerifyTokenType;
    if (tokenPayload.email !== email) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    const userDetailResult = await getUserDetailByEmail(email);
    const existingUser = userDetailResult[0];
    const tokenResult = await searchTokenByCondition({ value: token, type: 'verify', userId: tokenPayload.userId });
    if (!tokenResult.length || !existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    await updateUserDetailById(existingUser.userId, { isEmailVerified: true });
    await updateUserById(existingUser.userId, { status: 'actived' });
    await removeTokenByCondition({ value: token, userId: existingUser.userId, type: 'verify' });

    return new ApiResponse(StatusCodes.OK, 'Email was verified successfully!', tokenPayload).send(res);
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

    await removeTokenByCondition({ userId: users.id, type: 'refresh' });
    await insertToken({
      value: refreshToken,
      userId: users.id,
      expirationTime: timeInVietNam().add(30, 'second').toDate(),
      type: 'refresh'
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
