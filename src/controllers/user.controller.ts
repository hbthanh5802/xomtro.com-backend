import { searchTokenByCondition } from '@/services/token.service';
import { getUserDetailByEmail, updateUserById, updateUserDetailById } from '@/services/user.service';
import { tokenSchemaType } from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { generateVerifyEmailContent, sendEmail } from '@/utils/email.helper';
import { formatTimeForVietnamese, timeInVietNam } from '@/utils/time.helper';
import { emailVerifyTokenType, generateVerifyEmailToken, verifyJwtToken } from '@/utils/token.helper';
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { insertToken, removeTokenByCondition } from './../services/token.service';

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
      await removeTokenByCondition({ userId: existingUser.userId, type: 'verify', target: 'email' });
      const verifyToken = generateVerifyEmailToken(existingUser.userId, existingUser.email);

      const expirationTime = timeInVietNam().add(5, 'minute').toDate();
      const tokenPayload: tokenSchemaType = {
        userId: existingUser.userId,
        value: verifyToken,
        type: 'verify',
        expirationTime: expirationTime,
        target: 'email'
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
    const tokenResult = await searchTokenByCondition({
      value: token,
      type: 'verify',
      userId: tokenPayload.userId,
      target: 'email'
    });
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

export const changeUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser!;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const { password: currentUserPassword, id } = currentUser.users!;
    const isMatching = await bcrypt.compare(oldPassword, currentUserPassword);
    if (!isMatching) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'Old password is incorrect!').send(res);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUserById(id!, { password: hashedPassword });
    return new ApiResponse(StatusCodes.OK, 'Change password successfully!').send(res);
  } catch (error) {
    next(error);
  }
};
