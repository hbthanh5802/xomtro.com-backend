import axiosRequest from '@/configs/axiosClient.config';
import googleClient from '@/configs/google.config';
import { insertAsset } from '@/services/asset.service';
import { uploadImageFromUrl } from '@/services/fileUpload.service';
import { insertToken, removeTokenByCondition, removeTokenById, searchTokenByCondition } from '@/services/token.service';
import {
  getFullUserByConditions,
  getUserDetailByEmail,
  insertUser,
  insertUserDetail,
  selectUserByConditions,
  updateUserById
} from '@/services/user.service';
import { googleUserInfoResponseType } from '@/types/oauth.type';
import { assetSchemaType, tokenSchemaType, userDetailSchemaType, userSchemaType } from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { generateVerifyEmailContent, sendEmail } from '@/utils/email.helper';
import { generateFileName } from '@/utils/file.helper';
import { formatTimeForVietnamese, timeInVietNam } from '@/utils/time.helper';
import {
  generateAccessToken,
  generateOtpCode,
  generateRefreshToken,
  refreshExpirationTime,
  tokenPayloadType,
  verifyGoogleToken,
  verifyJwtToken
} from '@/utils/token.helper';
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

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
    const userResult = await insertUser(userPayload);
    //
    const userDetailPayload: userDetailSchemaType = {
      role,
      firstName,
      lastName,
      userId: userResult[0].id,
      email,
      phone
    };
    const userDetailResult = await insertUserDetail(userDetailPayload);
    return new ApiResponse(StatusCodes.CREATED, 'Register successfully!', userDetailResult).send(res);
  } catch (error) {
    next(error);
  }
};

const handleUserTokenProcess = async (tokenPayload: tokenPayloadType) => {
  try {
    const { userId, email, tokenVersion } = tokenPayload;
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await removeTokenByCondition({ userId: userId, type: 'refresh', target: 'refresh' });
    await insertToken({
      value: refreshToken,
      userId: userId,
      expirationTime: timeInVietNam().add(refreshExpirationTime, 'second').toDate(),
      type: 'refresh',
      target: 'refresh'
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
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

    const { accessToken, refreshToken } = await handleUserTokenProcess(tokenPayload);

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

export const refreshUserToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRefreshToken = req.cookies.refreshToken;
    if (!userRefreshToken) {
      return new ApiResponse(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED).send(res);
    }

    const tokenPayload = await verifyJwtToken(userRefreshToken, 'refresh');

    const userTokenResult = await searchTokenByCondition({
      value: userRefreshToken,
      type: 'refresh',
      target: 'refresh',
      userId: tokenPayload.userId
    });
    const existingUserRefreshToken = userTokenResult[0];

    if (!existingUserRefreshToken) {
      return new ApiResponse(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED).send(res);
    }

    await removeTokenById(existingUserRefreshToken.id);

    const newTokenPayload: tokenPayloadType = {
      userId: tokenPayload.userId,
      email: tokenPayload.email,
      tokenVersion: tokenPayload.tokenVersion
    };

    const { accessToken: newRefreshToken, refreshToken: newAccessToken } =
      await handleUserTokenProcess(newTokenPayload);

    res.cookie('refreshToken', newRefreshToken, {
      sameSite: 'strict',
      secure: true,
      httpOnly: true
    });

    const responseData = { meta: { accessToken: newAccessToken, refresh: newRefreshToken } };
    return new ApiResponse(StatusCodes.OK, 'Refresh successfully!', responseData).send(res);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { users, users_detail } = req.currentUser!;
    await removeTokenByCondition({ userId: users.id, type: 'refresh', target: 'refresh' });
    await updateUserById(users.id!, { tokenVersion: users.tokenVersion! + 1 });
    res.clearCookie('refreshToken');
    return new ApiResponse(StatusCodes.OK, 'Logout successfully!').send(res);
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    const userInfoResponse = await axiosRequest<googleUserInfoResponseType>({
      method: 'GET',
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      headers: { Authorization: `Bearer ${credential}` }
    });

    const { email, email_verified, given_name, family_name, picture, sub } = userInfoResponse;

    // Check existing user in database
    const existingUser = await getUserDetailByEmail(email);
    if (!existingUser.length) {
      // Create a new user
      const defaultUserPassword = given_name.toLowerCase() + '@123456@password';
      const hashedPassword = await bcrypt.hash(defaultUserPassword, 10);
      const userPayload: userSchemaType = {
        password: hashedPassword,
        provider: 'google',
        status: 'actived',
        googleId: sub
      };
      const insertUserResult = await insertUser(userPayload);
      const { id: userId } = insertUserResult[0]!;

      // Upload user avatar
      const uniqueFileName = generateFileName();
      const uploadAvatarResponse = await uploadImageFromUrl(picture, {
        folder: 'avatars',
        publicIdPrefix: uniqueFileName
      });
      const insertAvatarPayload: assetSchemaType = {
        type: 'image',
        url: uploadAvatarResponse.url,
        name: uploadAvatarResponse.public_id,
        tags: JSON.stringify(['avatar']),
        folder: 'avatars',
        format: uploadAvatarResponse.format,
        userId: userId
      };
      const insertAvatarResult = await insertAsset(insertAvatarPayload);

      // Create user detail
      const userDetailPayload: userDetailSchemaType = {
        userId,
        email: email!,
        isEmailVerified: !!email_verified,
        firstName: family_name!,
        lastName: given_name!,
        avatarAssetId: insertAvatarResult[0].id,
        phone: ''
      };
      await insertUserDetail(userDetailPayload);
    }

    const fullUserResult = await getFullUserByConditions({ email: email });
    if (!fullUserResult.length) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Some thing went wrong!');
    }
    const { users, users_detail } = fullUserResult[0];

    const tokenPayload: tokenPayloadType = {
      userId: users.id,
      email: users_detail.email,
      tokenVersion: users.tokenVersion
    };

    const { accessToken, refreshToken } = await handleUserTokenProcess(tokenPayload);

    res.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict'
    });

    const responseData = {
      userDetail: users_detail,
      meta: { accessToken, refreshToken }
    };

    const statusCode = !!existingUser.length ? StatusCodes.OK : StatusCodes.CREATED;

    return new ApiResponse(statusCode, StatusCodes[statusCode], responseData).send(res);
  } catch (error) {
    next(error);
  }
};

export const getForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;
    if (!email) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST).send(res);
    }

    const existingUser = await getUserDetailByEmail(email as string);
    if (!existingUser.length) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }
    // Clear all user existing reset-password token
    await removeTokenByCondition({
      target: 'password',
      userId: existingUser[0].userId,
      type: 'otp'
    });
    //
    const otpCode = generateOtpCode();
    const expirationTime = timeInVietNam().add(5, 'minute').toDate();
    const tokenPayload: tokenSchemaType = {
      type: 'otp',
      value: otpCode,
      expirationTime,
      userId: existingUser[0].userId,
      target: 'password'
    };
    await insertToken(tokenPayload);
    // Send email
    const emailContent = generateVerifyEmailContent(`<h2>${otpCode}</h2>`, formatTimeForVietnamese(expirationTime));
    await sendEmail(email as string, 'Forgot Your Password', emailContent);

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK).send(res);
  } catch (error) {
    next(error);
  }
};

export const completeForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, confirmPassword, otpCode } = req.body;
    // Check user
    const existingUser = await getFullUserByConditions({ email });
    if (!existingUser.length) {
      return new ApiResponse(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN).send(res);
    }
    const { users } = existingUser[0];
    //
    const existingOtpCode = await searchTokenByCondition({
      value: otpCode,
      userId: users.id,
      target: 'password',
      isActived: true,
      expirationTime: timeInVietNam().toDate()
    });
    if (!existingOtpCode.length) {
      return new ApiResponse(StatusCodes.FORBIDDEN, 'OTP is expired!').send(res);
    }
    // Check validation
    if (password !== confirmPassword) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'Confirm password must be similar to new password').send(res);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserById(users.id, { password: hashedPassword, tokenVersion: users.tokenVersion + 1 });
    // Clear all reset password token
    await removeTokenByCondition({
      target: 'password',
      userId: users.id,
      type: 'otp'
    });

    return new ApiResponse(StatusCodes.OK, 'Password is changed successfully!').send(res);
  } catch (error) {
    next(error);
  }
};
